import { z } from "zod";
import { EVENT } from "@/config/event";
import { step1Schema, step2Schema, step3Schema } from "@/lib/validation/registration";

// What a nevező can change from the self-service edit link. Deliberately
// narrower than the registration form: email, wantsShirt and premiumMedia
// are left out because they change the fee that was already (or is about
// to be) charged via Stripe — those still go through the organiser.
// shirtCut/shirtSize stay editable (size/cut swaps don't change price) but
// only up to EVENT.registration.shirtEditClosesAt, enforced server-side.
export const registrationEditSchema = step1Schema
  .omit({ email: true })
  .merge(step2Schema)
  .merge(step3Schema)
  .extend({
    shirtCut: z.enum(["Női", "Férfi"]).optional(),
    shirtSize: z.enum(EVENT.shirt.sizes as unknown as [string, ...string[]]).optional(),
  });

export type RegistrationEditInput = z.infer<typeof registrationEditSchema>;

export const EDIT_FIELDS = Object.keys(registrationEditSchema.shape) as (keyof RegistrationEditInput)[];
