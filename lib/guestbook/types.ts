export type Message = {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
  status: "visible" | "hidden";
  is_pinned: boolean;
  likes_count: number;
  reply_content: string | null;
  replied_at: string | null;
  updated_at: string;
};
export type Stats = {
  total: number;
  today: number;
  likes: number;
  week: number;
  trend: { day: string; count: number }[];
};
export type MessagePage = { messages: Message[]; nextCursor: string | null };
export type ApiResult<T> = { success: boolean; message: string; data: T };
