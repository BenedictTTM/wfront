// app/api/users/me/avatar-upload-url/route.ts — proxy for Cloudinary signed avatar upload params
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api-client";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: "Authentication required to generate avatar upload URL" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/users/me/avatar-upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      let errorBody: unknown = {};
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: response.statusText };
      }
      return NextResponse.json(errorBody, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to generate avatar upload URL" },
      { status: 500 }
    );
  }
}
