import { z } from "zod";
import { EVENT } from "@/config/event";

export type RegistrationLocale = "hu" | "en";

const MESSAGES = {
  hu: {
    required: "Kötelező mező.",
    lastName: "Add meg a vezetékneved.",
    firstName: "Add meg a keresztneved.",
    email: "Add meg az e-mail címed.",
    emailInvalid: "Érvénytelen e-mail cím.",
    birthYearFormat: "Négy számjegyű évszám (pl. 1995).",
    birthYearRange: (min: number, max: number) => `A születési évnek ${min} és ${max} közé kell esnie.`,
    sex: "Válaszd ki a nemed.",
    division: "Válaszd ki a kategóriát.",
    weightRange: (min: number, max: number) => `${min} és ${max} kg közé essen.`,
    consent: "A nevezéshez el kell fogadnod a feltételeket.",
    shirtCut: "Válaszd ki a póló fazonját.",
    shirtSize: "Válaszd ki a pólóméretet.",
  },
  en: {
    required: "Required.",
    lastName: "Enter your last name.",
    firstName: "Enter your first name.",
    email: "Enter your e-mail address.",
    emailInvalid: "Invalid e-mail address.",
    birthYearFormat: "Four-digit year (e.g. 1995).",
    birthYearRange: (min: number, max: number) => `Birth year must be between ${min} and ${max}.`,
    sex: "Select your sex.",
    division: "Select a division.",
    weightRange: (min: number, max: number) => `Must be between ${min} and ${max} kg.`,
    consent: "You must accept the terms to register.",
    shirtCut: "Select a shirt cut.",
    shirtSize: "Select a shirt size.",
  },
} as const;

const numericString = (min: number, max: number, requiredMsg: string, rangeMsg: string) =>
  z
    .string()
    .trim()
    .min(1, requiredMsg)
    .refine((v) => {
      const n = Number(v.replace(",", "."));
      return Number.isFinite(n) && n >= min && n <= max;
    }, rangeMsg);

export function buildRegistrationSchema(locale: RegistrationLocale = "hu") {
  const m = MESSAGES[locale];

  const step1Schema = z.object({
    lastName: z.string().trim().min(1, m.lastName),
    firstName: z.string().trim().min(1, m.firstName),
    email: z.string().trim().min(1, m.email).email(m.emailInvalid),
    birthYear: z
      .string()
      .trim()
      .regex(/^\d{4}$/, m.birthYearFormat)
      .refine((v) => {
        const n = Number(v);
        return n >= EVENT.registration.minBirthYear && n <= EVENT.registration.maxBirthYear;
      }, m.birthYearRange(EVENT.registration.minBirthYear, EVENT.registration.maxBirthYear)),
    sex: z.enum(["Nő", "Férfi"], { message: m.sex }),
  });

  const step2Schema = z.object({
    division: z.enum(["Újonc", "Versenyző"], { message: m.division }),
    club: z.string().trim().optional(),
  });

  const step3Schema = z.object({
    bodyweight: numericString(30, 250, m.required, m.weightRange(30, 250)),
    openerSquat: numericString(20, 400, m.required, m.weightRange(20, 400)),
    openerBench: numericString(20, 400, m.required, m.weightRange(20, 400)),
    openerDeadlift: numericString(20, 400, m.required, m.weightRange(20, 400)),
    mcText: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  });

  const step4Schema = z.object({
    wantsShirt: z.boolean(),
    shirtCut: z.enum(["Női", "Férfi"]).optional(),
    shirtSize: z.enum(EVENT.shirt.sizes as unknown as [string, ...string[]]).optional(),
    premiumMedia: z.boolean(),
  });

  const step5Schema = z.object({
    consent: z.literal(true, { message: m.consent }),
    honeypot: z.string().max(0, "").optional(),
  });

  const schema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .merge(step4Schema)
    .merge(step5Schema)
    .superRefine((data, ctx) => {
      if (!data.wantsShirt) return;
      if (!data.shirtCut) {
        ctx.addIssue({ code: "custom", path: ["shirtCut"], message: m.shirtCut });
      }
      if (!data.shirtSize) {
        ctx.addIssue({ code: "custom", path: ["shirtSize"], message: m.shirtSize });
      }
    });

  return { schema, step1Schema, step2Schema, step3Schema, step4Schema, step5Schema };
}

// Hungarian is the default wizard's schema — kept as the original named
// exports so the existing (hu-only) call sites don't need to change.
const hu = buildRegistrationSchema("hu");
export const registrationSchema = hu.schema;
export type RegistrationInput = z.infer<typeof registrationSchema>;

export const STEP_FIELDS = [
  Object.keys(hu.step1Schema.shape) as (keyof RegistrationInput)[],
  Object.keys(hu.step2Schema.shape) as (keyof RegistrationInput)[],
  Object.keys(hu.step3Schema.shape) as (keyof RegistrationInput)[],
  Object.keys(hu.step4Schema.shape) as (keyof RegistrationInput)[],
  Object.keys(hu.step5Schema.shape) as (keyof RegistrationInput)[],
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
  wantsShirt: false,
  shirtCut: undefined as unknown as RegistrationInput["shirtCut"],
  shirtSize: undefined as unknown as RegistrationInput["shirtSize"],
  premiumMedia: false,
  consent: undefined as unknown as true,
  honeypot: "",
};
