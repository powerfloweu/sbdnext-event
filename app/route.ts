// app/route.ts  — gyökér => /verseny (301)
import { NextResponse } from "next/server";

export function GET(req: Request) {
  return NextResponse.redirect(new URL("/verseny", req.url), { status: 301 });
}