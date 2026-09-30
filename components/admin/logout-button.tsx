"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await getSupabaseBrowser().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleLogout}>
      <LogOut className="size-4" aria-hidden="true" />
      Kijelentkezés
    </Button>
  );
}
