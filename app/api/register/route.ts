import { NextRequest, NextResponse } from "next/server";
import { registerForEvent, getEventById } from "@/lib/db";
import { uploadToR2 } from "@/lib/r2-storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const eventId = formData.get("eventId") as string;
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const collegeName = formData.get("collegeName") as string;
    const universityName = formData.get("universityName") as string;
    const teamSize = parseInt(formData.get("teamSize") as string) || 1;
    const teamMembers = JSON.parse(
      (formData.get("teamMembers") as string) || "[]",
    );
    const upiTransactionId = formData.get("upiTransactionId") as string;
    const accountHolderName = formData.get("accountHolderName") as string;
    const file = formData.get("file") as File | null;

    // Validate required fields
    if (
      !eventId ||
      !fullName ||
      !email ||
      !phone ||
      !collegeName ||
      !universityName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate team size
    const validTeamSize = teamSize || 1;
    if (validTeamSize < 1 || validTeamSize > 10) {
      return NextResponse.json(
        { error: "Team size must be between 1 and 10" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if event exists and if it's online
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Upload file to R2 if event is online and file is provided
    let uploadFileUrl: string | undefined;
    if (event.isOnline) {
      if (!file) {
        return NextResponse.json(
          { error: "File upload is required for online events" },
          { status: 400 },
        );
      }

      try {
        uploadFileUrl = await uploadToR2(file, "event-registrations");
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload file. Please try again." },
          { status: 500 },
        );
      }
    }

    // Register for event
    const result = await registerForEvent({
      eventId,
      fullName,
      email,
      phone,
      collegeName,
      universityName,
      teamSize: teamSize || 1,
      teamMembers: teamMembers || [],
      upiTransactionId,
      accountHolderName,
      uploadFileUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        registrationId: result.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate registration
    if (error instanceof Error && error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to register for event. Please try again." },
      { status: 500 },
    );
  }
}
