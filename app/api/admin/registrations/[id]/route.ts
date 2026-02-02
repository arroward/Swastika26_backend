import { NextRequest, NextResponse } from "next/server";
import { deleteRegistration } from "@/lib/db";
import { cookies } from "next/headers";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check authentication
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("admin_session");

        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let admin;
        try {
            admin = JSON.parse(sessionCookie.value);
        } catch (e) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // Only superadmin can delete registrations
        if (admin.role !== "superadmin") {
            return NextResponse.json(
                { error: "Access denied. Only superadmins can delete registrations." },
                { status: 403 }
            );
        }

        const success = await deleteRegistration(id);

        if (!success) {
            return NextResponse.json(
                { error: "Registration not found or failed to delete" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting registration:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
