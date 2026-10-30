"use client";

// Wraps the /admin sections in tabs so D and Miki don't have to scroll through
// one long page to find e.g. the weight-class stats. Server-rendered section
// content is passed in as props/children from app/admin/page.tsx; this
// component only owns which tab is open (client-side, uses the shared Tabs UI
// primitive from components/ui/tabs.tsx).

import type { ReactNode } from "react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AdminTabsProps {
  overview: ReactNode;
  registrations: ReactNode;
  notifySignups: ReactNode;
  feedback: ReactNode;
  weightClassStats: ReactNode;
  results: ReactNode;
  testRegistration: ReactNode;
}

export function AdminTabs({
  overview,
  registrations,
  notifySignups,
  feedback,
  weightClassStats,
  results,
  testRegistration,
}: AdminTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Áttekintés</TabsTrigger>
        <TabsTrigger value="registrations">Nevezések</TabsTrigger>
        <TabsTrigger value="notify">Feliratkozók</TabsTrigger>
        <TabsTrigger value="feedback">Visszajelzések</TabsTrigger>
        <TabsTrigger value="weight-classes">Súlycsoport-statisztika</TabsTrigger>
        <TabsTrigger value="results">Eredmények</TabsTrigger>
        <TabsTrigger value="test">Teszt nevezés</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">{overview}</TabsContent>
      <TabsContent value="registrations">{registrations}</TabsContent>
      <TabsContent value="notify">{notifySignups}</TabsContent>
      <TabsContent value="feedback">{feedback}</TabsContent>
      <TabsContent value="weight-classes">{weightClassStats}</TabsContent>
      <TabsContent value="results">{results}</TabsContent>
      <TabsContent value="test">{testRegistration}</TabsContent>
    </Tabs>
  );
}
