import { z } from "zod";

export const weightSchema = z.object({
  name: z.string().trim().min(1, "Add meg a neved."),
  email: z.string().trim().min(1, "Add meg az e-mail címed.").email("Érvénytelen e-mail cím."),
  weight: z
    .string()
    .trim()
    .min(1, "Add meg a testsúlyod.")
    .refine((v) => {
      const n = Number(v.replace(",", "."));
      return Number.isFinite(n) && n >= 30 && n <= 250;
    }, "A testsúlynak 30 és 250 kg közé kell esnie."),
  registrationId: z.string().trim().optional(),
});

export type WeightInput = z.infer<typeof weightSchema>;
