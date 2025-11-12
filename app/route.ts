// app/route.ts — minden / kérés menjen a /verseny oldalra (301)
import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL("/verseny", request.url);
  return NextResponse.redirect(url, { status: 301 });
}