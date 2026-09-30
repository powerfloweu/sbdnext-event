import { z } from "zod";

export const notifySignupSchema = z.object({
  email: z.string().trim().min(1, "Add meg az e-mail címed.").email("Érvénytelen e-mail cím."),
  locale: z.enum(["hu", "en"]).optional(),
  honeypot: z.string().max(0, "").optional(),
});

export type NotifySignupInput = z.infer<typeof notifySignupSchema>;

export const notifyFeedbackSchema = z.object({
  email: z.string().trim().min(1).email("Érvénytelen e-mail cím."),
  feedback: z.string().trim().min(1).max(2000),
});

export type NotifyFeedbackInput = z.infer<typeof notifyFeedbackSchema>;
