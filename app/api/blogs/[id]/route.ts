import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE ??
    "https://shop-template-backend-nine.vercel.app";
  try {
    const res = await fetch(`${apiBase}/api/blogs/${id}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE ??
    "https://shop-template-backend-nine.vercel.app";
  try {
    const body = await request.json();
    const auth = request.headers.get("authorization");
    const res = await fetch(`${apiBase}/api/blogs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE ??
    "https://shop-template-backend-nine.vercel.app";
  try {
    const auth = request.headers.get("authorization");
    const res = await fetch(`${apiBase}/api/blogs/${id}`, {
      method: "DELETE",
      headers: auth ? { Authorization: auth } : {},
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 502 }
    );
  }
}
