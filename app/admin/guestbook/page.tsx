import type { Metadata } from "next";
import GuestbookAdmin from "@/components/guestbook/GuestbookAdmin";
export const metadata: Metadata = {
  title: "Visitor Wall · 管理工作台",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <GuestbookAdmin />;
}
