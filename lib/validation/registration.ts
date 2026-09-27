import { z } from "zod";
import { EVENT } from "@/config/event";

const numericString = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .min(1, "Kötelező mező.")
    .refine((v) => {
      const n = Number(v.replace(",", "."));
      return Number.isFinite(n) && n >= min && n <= max;
    }, message);

export const step1Schema = z.object({
  lastName: z.string().trim().min(1, "Add meg a vezetékneved."),
  firstName: z.string().trim().min(1, "Add meg a keresztneved."),
  email: z.string().trim().min(1, "Add meg az e-mail címed.").email("Érvénytelen e-mail cím."),
  birthYear: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Négy számjegyű évszám (pl. 1995).")
    .refine((v) => {
      const n = Number(v);
      return n >= EVENT.registration.minBirthYear && n <= EVENT.registration.maxBirthYear;
    }, `A születési évnek ${EVENT.registration.minBirthYear} és ${EVENT.registration.maxBirthYear} közé kell esnie.`),
  sex: z.enum(["Nő", "Férfi"], { message: "Válaszd ki a nemed." }),
});

export const step2Schema = z.object({
  division: z.enum(["Újonc", "Versenyző"], { message: "Válaszd ki a kategóriát." }),
  club: z.string().trim().optional(),
});

export const step3Schema = z.object({
  bodyweight: numericString(30, 250, "30 és 250 kg közé essen."),
  openerSquat: numericString(20, 400, "20 és 400 kg közé essen."),
  openerBench: numericString(20, 400, "20 és 400 kg közé essen."),
  openerDeadlift: numericString(20, 400, "20 és 400 kg közé essen."),
  mcText: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const step4Schema = z.object({
  shirtCut: z.enum(["Női", "Férfi"], { message: "Válaszd ki a póló fazonját." }),
  shirtSize: z.enum(EVENT.shirt.sizes as unknown as [string, ...string[]], {
    message: "Válaszd ki a pólóméretet.",
  }),
  premiumMedia: z.boolean(),
});

export const step5Schema = z.object({
  consent: z.literal(true, { message: "A nevezéshez el kell fogadnod a feltételeket." }),
  honeypot: z.string().max(0, "").optional(),
});

export const registrationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const STEP_FIELDS = [
  Object.keys(step1Schema.shape) as (keyof RegistrationInput)[],
  Object.keys(step2Schema.shape) as (keyof RegistrationInput)[],
  Object.keys(step3Schema.shape) as (keyof RegistrationInput)[],
  Object.keys(step4Schema.shape) as (keyof RegistrationInput)[],
  Object.keys(step5Schema.shape) as (keyof RegistrationInput)[],
];

export const REGISTRATION_DEFAULTS: RegistrationInput = {
  lastName: "",
  firstName: "",
  email: "",
  birthYear: "",
  sex: undefined as unknown as RegistrationInput["sex"],
  division: undefined as unknown as RegistrationInput["division"],
  club: "",
  bodyweight: "",
  openerSquat: "",
  openerBench: "",
  openerDeadlift: "",
  mcText: "",
  notes: "",
  shirtCut: undefined as unknown as RegistrationInput["shirtCut"],
  shirtSize: undefined as unknown as RegistrationInput["shirtSize"],
  premiumMedia: false,
  consent: undefined as unknown as true,
  honeypot: "",
};
