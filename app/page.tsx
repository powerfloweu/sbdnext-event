// app/page.tsx  — server redirect a /verseny oldalra
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/verseny");
}
export const dynamic = "force-dynamic";