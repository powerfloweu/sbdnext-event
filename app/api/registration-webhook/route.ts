import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL =
  "https://hook.eu1.make.com/6vbe2dxien274ohy91ew22lp9bbfzrl3";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const resp = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      console.error("Make webhook error:", resp.status, await resp.text());
      return NextResponse.json({ ok: false }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}