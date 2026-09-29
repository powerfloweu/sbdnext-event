import { z } from "zod";

export const notifySignupSchema = z.object({
  email: z.string().trim().min(1, "Add meg az e-mail címed.").email("Érvénytelen e-mail cím."),
  locale: z.enum(["hu", "en"]).optional(),
  honeypot: z.string().max(0, "").optional(),
});

export type NotifySignupInput = z.infer<typeof notifySignupSchema>;
