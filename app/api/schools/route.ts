// app/api/schools/route.ts — proxy for querying schools
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const targetUrl = `${API_URL}/schools?${searchParams.toString()}`;

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache on edge for 60 seconds
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: res.statusText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch schools";
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
