import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

// Issues short lived upload tokens so partners' browsers can send photos
// straight to Vercel Blob. The files never pass through this server, which
// means they are stored exactly as the partner uploaded them: no resizing,
// no re-encoding, no size limit imposed by serverless request bodies.
export async function POST(request) {
  const body = await request.json();

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        maximumSizeInBytes: 100 * 1024 * 1024,
        // Random suffix keeps every file URL unguessable.
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // Nothing to do. The spot record stores the URLs on submit.
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
