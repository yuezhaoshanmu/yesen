-- All public writes go through authenticated server routes. No demo rows.
begin;
create table public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(btrim(nickname)) between 1 and 20),
  content text not null check (char_length(btrim(content)) between 1 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'visible' check (status in ('visible','hidden')),
  is_pinned boolean not null default false,
  likes_count integer not null default 0 check (likes_count >= 0),
  reply_content text check (reply_content is null or char_length(btrim(reply_content)) between 1 and 600),
  replied_at timestamptz,
  check ((reply_content is null) = (replied_at is null))
);
create index guestbook_public_order on public.guestbook_messages (is_pinned desc, created_at desc, id desc) where status = 'visible';
create index guestbook_created_at on public.guestbook_messages (created_at desc);
create index guestbook_status on public.guestbook_messages (status);
create index guestbook_admin_order on public.guestbook_messages (is_pinned desc, created_at desc, id desc);

-- Private anti-abuse data: only irreversible keyed hashes, never raw IP addresses.
create table public.guestbook_rate_limits (key text primary key, window_start timestamptz not null, hits integer not null);
create table public.guestbook_likes (
  message_id uuid not null references public.guestbook_messages on delete cascade,
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, visitor_hash)
);
create table public.guestbook_requests (
  request_id uuid primary key,
  visitor_hash text not null,
  message_id uuid not null references public.guestbook_messages on delete cascade,
  created_at timestamptz not null default now()
);
-- RLS prevents hidden UPDATEs from reaching anon Postgres Changes subscribers.
-- A separate content-free tombstone stream lets every client remove withdrawn rows.
create table public.guestbook_events (
  id bigint generated always as identity primary key,
  message_id uuid not null,
  created_at timestamptz not null default now()
);
create index guestbook_events_created on public.guestbook_events(created_at);
alter table public.guestbook_messages enable row level security;
alter table public.guestbook_rate_limits enable row level security;
alter table public.guestbook_likes enable row level security;
alter table public.guestbook_requests enable row level security;
alter table public.guestbook_events enable row level security;
revoke all on public.guestbook_messages, public.guestbook_rate_limits, public.guestbook_likes, public.guestbook_requests, public.guestbook_events from anon, authenticated;
grant select on public.guestbook_messages, public.guestbook_events to anon, authenticated;
grant all on public.guestbook_messages, public.guestbook_rate_limits, public.guestbook_likes, public.guestbook_requests, public.guestbook_events to service_role;
grant usage, select on sequence public.guestbook_events_id_seq to service_role;
create policy visible_messages on public.guestbook_messages for select to anon, authenticated using (status = 'visible');
create policy public_tombstones on public.guestbook_events for select to anon, authenticated using (true);

create function public.guestbook_changed() returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'DELETE' then
    if old.status = 'visible' then insert into public.guestbook_events(message_id) values(old.id); end if;
    return old;
  end if;
  new.updated_at := clock_timestamp();
  if old.status = 'visible' and new.status = 'hidden' then
    insert into public.guestbook_events(message_id) values(new.id);
  end if;
  return new;
end; $$;
create trigger guestbook_changed before update or delete on public.guestbook_messages for each row execute function public.guestbook_changed();

-- INSERT ON CONFLICT locks one bucket, making the limit safe across instances.
create function public.guestbook_take_rate(p_key text, p_limit integer, p_seconds integer) returns boolean
language plpgsql set search_path = '' as $$
declare v_hits integer;
begin
  if p_limit < 1 or p_seconds < 1 then raise exception 'invalid_limit'; end if;
  insert into public.guestbook_rate_limits(key, window_start, hits) values (p_key, clock_timestamp(), 1)
  on conflict (key) do update set
    hits = case when guestbook_rate_limits.window_start <= clock_timestamp() - make_interval(secs => p_seconds) then 1 else guestbook_rate_limits.hits + 1 end,
    window_start = case when guestbook_rate_limits.window_start <= clock_timestamp() - make_interval(secs => p_seconds) then clock_timestamp() else guestbook_rate_limits.window_start end
  returning hits into v_hits;
  return v_hits <= p_limit;
end; $$;

create function public.guestbook_submit(p_nickname text, p_content text, p_visitor text, p_network text, p_request uuid)
returns jsonb language plpgsql set search_path = '' as $$
declare v_message public.guestbook_messages; v_id uuid;
begin
  -- Serialize retries of the same idempotency key, even on different app instances.
  perform pg_advisory_xact_lock(hashtextextended(p_request::text, 0));
  select message_id into v_id from public.guestbook_requests where request_id = p_request and visitor_hash = p_visitor;
  if v_id is not null then
    select * into v_message from public.guestbook_messages where id = v_id and status = 'visible';
    return jsonb_build_object('message', to_jsonb(v_message), 'replayed', true);
  end if;
  if exists (select 1 from public.guestbook_requests where request_id = p_request) then return jsonb_build_object('conflict',true); end if;
  if not public.guestbook_take_rate('post:ip:' || p_network, 3, 60) then return jsonb_build_object('limited',true); end if;
  if not public.guestbook_take_rate('post:visitor:' || p_visitor, 3, 60) then return jsonb_build_object('limited',true); end if;
  insert into public.guestbook_messages(nickname, content) values(p_nickname,p_content) returning * into v_message;
  insert into public.guestbook_requests(request_id,visitor_hash,message_id) values(p_request,p_visitor,v_message.id);
  return jsonb_build_object('message',to_jsonb(v_message),'replayed',false);
end; $$;

create function public.guestbook_like(p_message uuid, p_visitor text) returns jsonb
language plpgsql set search_path = '' as $$
declare v_count integer; v_inserted integer;
begin
  -- Lock before inserting so simultaneous hide/delete and like operations are ordered.
  select likes_count into v_count from public.guestbook_messages where id = p_message and status = 'visible' for update;
  if not found then return null; end if;
  insert into public.guestbook_likes(message_id,visitor_hash) values(p_message,p_visitor) on conflict do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 1 then
    update public.guestbook_messages set likes_count = likes_count + 1 where id = p_message returning likes_count into v_count;
  end if;
  return jsonb_build_object('likes_count',v_count,'already_liked',v_inserted = 0);
end; $$;

create function public.guestbook_page(p_admin boolean default false, p_search text default '', p_status text default null,
  p_pinned boolean default null, p_created timestamptz default null, p_id uuid default null)
returns setof public.guestbook_messages language sql stable set search_path = '' as $$
  select * from public.guestbook_messages m
  where (p_admin or m.status = 'visible')
    and (p_status is null or m.status = p_status)
    and (p_search = '' or strpos(lower(m.nickname),lower(p_search)) > 0 or strpos(lower(m.content),lower(p_search)) > 0)
    and (p_id is null or (m.is_pinned,m.created_at,m.id) < (p_pinned,p_created,p_id))
  order by m.is_pinned desc, m.created_at desc, m.id desc limit 21;
$$;
create function public.guestbook_stats(p_admin boolean default false) returns jsonb
language sql stable set search_path = '' as $$
  with bounds as (select (now() at time zone 'Asia/Shanghai')::date as today),
  filtered as (select * from public.guestbook_messages where p_admin or status = 'visible'),
  days as (select today - n as day from bounds, generate_series(6,0,-1) n),
  trend as (select d.day, count(f.id) as count from days d left join filtered f on (f.created_at at time zone 'Asia/Shanghai')::date = d.day group by d.day)
  select jsonb_build_object(
    'total',count(*),'likes',coalesce(sum(likes_count),0),
    'today',count(*) filter (where created_at >= ((select today from bounds)::timestamp at time zone 'Asia/Shanghai')),
    'week',count(*) filter (where created_at >= (((select today from bounds) - 6)::timestamp at time zone 'Asia/Shanghai')),
    'trend',(select jsonb_agg(jsonb_build_object('day',day,'count',count) order by day) from trend)
  ) from filtered;
$$;
create function public.guestbook_cleanup() returns void language sql set search_path = '' as $$
  delete from public.guestbook_rate_limits where window_start < now() - interval '1 day';
  delete from public.guestbook_events where created_at < now() - interval '1 day';
  delete from public.guestbook_requests where created_at < now() - interval '7 days';
$$;
-- PostgreSQL functions grant EXECUTE to PUBLIC by default: explicitly revoke it.
revoke all on function public.guestbook_changed(), public.guestbook_take_rate(text,integer,integer), public.guestbook_submit(text,text,text,text,uuid), public.guestbook_like(uuid,text), public.guestbook_page(boolean,text,text,boolean,timestamptz,uuid), public.guestbook_stats(boolean), public.guestbook_cleanup() from public, anon, authenticated;
grant execute on function public.guestbook_changed(), public.guestbook_take_rate(text,integer,integer), public.guestbook_submit(text,text,text,text,uuid), public.guestbook_like(uuid,text), public.guestbook_page(boolean,text,text,boolean,timestamptz,uuid), public.guestbook_stats(boolean), public.guestbook_cleanup() to service_role;

-- Keep replica identity DEFAULT: never broadcast old message bodies through DELETE.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.guestbook_messages, public.guestbook_events;
  end if;
end $$;
commit;
