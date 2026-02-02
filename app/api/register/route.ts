
import { NextRequest, NextResponse } from "next/server";
import { registerForEvent } from "@/lib/db";
import { uploadToR2 } from "@/lib/r2-storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const eventId = formData.get("eventId") as string;
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const collegeName = formData.get("collegeName") as string;
        const universityName = formData.get("universityName") as string;
        const teamSize = parseInt(formData.get("teamSize") as string || "1");

        const teamMembersStr = formData.get("teamMembers") as string;
        const teamMembers = teamMembersStr ? JSON.parse(teamMembersStr) : [];

        const upiTransactionId = formData.get("upiTransactionId") as string;
        const accountHolderName = formData.get("accountHolderName") as string;

        // Check if we have a file URL (client-side upload) or a file object (server-side upload)
        const uploadFileUrl = formData.get("uploadFileUrl") as string;
        const file = formData.get("file") as File | null;

        let finalFileUrl = uploadFileUrl;

        // Handle file upload if URL is not provided but file is
        if (!finalFileUrl && file && file.size > 0) {
            try {
                console.log("Uploading file to R2...");
                finalFileUrl = await uploadToR2(file, "registrations");
            } catch (uploadError) {
                console.error("Error uploading file:", uploadError);
                return NextResponse.json(
                    { error: "Failed to upload file" },
                    { status: 500 }
                );
            }
        }

        if (!eventId || !fullName || !email || !phone) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const registration = await registerForEvent({
            eventId,
            fullName,
            email,
            phone,
            collegeName,
            universityName,
            teamSize,
            teamMembers,
            upiTransactionId,
            accountHolderName,
            uploadFileUrl: finalFileUrl,
        });

        return NextResponse.json({
            success: true,
            data: registration,
        });
    } catch (error: any) {
        console.error("Registration error:", error);

        // Handle specific DB errors (constraints, etc.)
        if (error.code === '23505') { // Unique violation
            return NextResponse.json(
                { error: "You have already registered for this event with this email." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
