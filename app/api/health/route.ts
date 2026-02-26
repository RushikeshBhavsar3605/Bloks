import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "OK",
      message: "Your API is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 },
  );
}
