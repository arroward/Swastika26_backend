import { NextRequest, NextResponse } from "next/server";
import { registerForEvent } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      eventId,
      fullName,
      email,
      phone,
      collegeName,
      universityName,
      teamSize,
      teamMembers,
    } = body;

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
