import { z } from "zod";
import { EVENT } from "@/config/event";

export const volunteerSchema = z.object({
  name: z.string().trim().min(1, "Add meg a neved."),
  email: z.string().trim().min(1, "Add meg az e-mail címed.").email("Érvénytelen e-mail cím."),
  day14: z.literal(true, { message: "Erősítsd meg, hogy a teljes napra tudsz jönni." }),
  position: z.string().trim().min(1, "Válaszd ki a preferált pozíciót."),
  shirtCut: z.enum(EVENT.shirt.cuts as unknown as [string, ...string[]], {
    message: "Válaszd ki a póló fazonját.",
  }),
  shirtSize: z.enum(EVENT.shirt.sizes as unknown as [string, ...string[]], {
    message: "Válaszd ki a pólóméretet.",
  }),
  honeypot: z.string().max(0).optional(),
});

export type VolunteerInput = z.infer<typeof volunteerSchema>;
