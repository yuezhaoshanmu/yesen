import { z } from "zod";

const unsafe =
  /<\s*\/?\s*[a-z!][^>]*|javascript\s*:|data\s*:\s*text\/html|[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/i;
export const plainText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "请填写内容。")
    .refine((v) => [...v].length <= max, `最多 ${max} 字。`)
    .refine((v) => !unsafe.test(v), "请使用纯文本，不要包含 HTML 或脚本。");
export const submissionSchema = z
  .object({
    nickname: plainText(20),
    content: plainText(300),
    requestId: z.string().uuid(),
  })
  .strict();
export const loginSchema = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(256),
  })
  .strict();
export const editSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("visibility"),
      status: z.enum(["visible", "hidden"]),
    })
    .strict(),
  z.object({ action: z.literal("pin"), is_pinned: z.boolean() }).strict(),
  z
    .object({ action: z.literal("reply"), content: plainText(600).nullable() })
    .strict(),
]);
export const cursorSchema = z
  .object({
    pinned: z.boolean(),
    created: z.string().datetime({ offset: true }),
    id: z.string().uuid(),
  })
  .strict();
