// app/api/cloudinary/delete/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE(request: NextRequest) {
  try {
    const { public_id }: { public_id: string } = await request.json();

    if (!public_id) {
      return NextResponse.json({ error: "public_id is required" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok") {
      return NextResponse.json({ error: "Failed to delete image" }, { status: 400 });
    }

    return NextResponse.json({ message: "Image deleted successfully", result });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}