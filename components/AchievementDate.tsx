import { achievementById } from '@/data/achievements';
import { dateText } from '@/data/achievement-dates';

export default function AchievementDate({ id, full = false }: { id: string; full?: boolean }) {
  const item = achievementById[id];
  if (!item?.date) return null;
  return <span className="achievement-date"><span>{item.dateLabel}</span><time dateTime={item.date ?? undefined}>{dateText(item.date, full)}</time></span>;
}
