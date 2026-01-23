import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      console.error("Download file error: No file URL provided");
      return NextResponse.json(
        { success: false, error: "File URL is required" },
        { status: 400 },
      );
    }

    console.log("Attempting to download file from:", fileUrl);

    // The URL should already be complete from R2_PUBLIC_URL
    // Just fetch it directly
    let response = await fetch(fileUrl);

    // If 404, try alternative R2.dev URL if the stored URL uses a custom domain
    if (!response.ok && response.status === 404) {
      console.log("Primary URL returned 404, trying alternative R2.dev URL...");

      // If URL has events.swastika.live, replace with r2.dev URL
      if (fileUrl.includes("events.swastika.live")) {
        const r2devUrl = fileUrl.replace(
          "https://events.swastika.live",
          String(process.env.R2_PUBLIC_URL),
        );
        console.log("Trying R2.dev URL:", r2devUrl);
        response = await fetch(r2devUrl);

        if (response.ok) {
          console.log("Successfully fetched from R2.dev URL");
        }
      }
    }

    if (!response.ok) {
      console.error(
        `Failed to fetch file: ${response.status} ${response.statusText}`,
      );
      console.error("Tried URL:", fileUrl);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch file: ${response.status} ${response.statusText}`,
          url: fileUrl,
        },
        { status: response.status },
      );
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "application/octet-stream",
    );
    headers.set("Content-Length", blob.size.toString());

    // Set Content-Disposition for better download handling
    const filename = fileUrl.split("/").pop() || "download";
    headers.set("Content-Disposition", `inline; filename="${filename}"`);

    console.log("File successfully fetched, size:", blob.size);

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to download file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
