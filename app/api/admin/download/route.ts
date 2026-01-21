import { NextRequest, NextResponse } from "next/server";
import {
  getAllRegistrations,
  getRegistrationsByEvent,
  getAdminManagedEvents,
} from "@/lib/db";
import { cookies } from "next/headers";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Helper to get admin from session
async function getAdminFromSession(request: NextRequest) {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value;
}

// Convert registrations to CSV format
function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) => {
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma
        return stringValue.includes(",") || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      })
      .join(","),
  );

  return [headers, ...rows].join("\n");
}

// Convert registrations to PDF format
function convertToPDF(data: any[], filename: string): ArrayBuffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  doc.setFontSize(16);
  doc.text("Event Registrations", 105, 15, { align: "center" });

  // Add date
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 22, {
    align: "center",
  });
  doc.text(`Total: ${data.length}`, 105, 27, { align: "center" });

  // Prepare table data
  const tableColumn = [
    "Name",
    "Email",
    "Phone",
    "Organization",
    "Event",
    "Date",
  ];
  const tableRows = data.map((reg) => [
    reg.fullName || "",
    reg.email || "",
    reg.phone || "",
    reg.organization || "-",
    reg.eventTitle || "-",
    new Date(reg.registrationDate).toLocaleDateString() || "",
  ]);

  // Add table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 32,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 10, right: 10 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 35 },
      5: { cellWidth: 22 },
    },
  });

  return doc.output("arraybuffer") as ArrayBuffer;
}

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminFromSession(request);

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const role = searchParams.get("role");
    const format = searchParams.get("format") || "csv"; // csv or pdf

    let data: any[] = [];

    // Superadmin downloads all registrations
    if (role === "superadmin") {
      data = await getAllRegistrations();
    }

    // Event coordinator downloads registrations for their event
    if (role === "event_coordinator" && eventId) {
      data = await getRegistrationsByEvent(eventId);
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: "No registrations found" },
        { status: 404 },
      );
    }

    const filename = eventId
      ? `registrations_${eventId}_${new Date().toISOString().split("T")[0]}`
      : `all_registrations_${new Date().toISOString().split("T")[0]}`;

    if (format === "pdf") {
      const pdfBuffer = convertToPDF(data, filename);

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Disposition": `attachment; filename="${filename}.pdf"`,
          "Content-Type": "application/pdf",
        },
      });
    }

    // CSV format (default)
    const csv = convertToCSV(data);

    return new NextResponse(csv, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error downloading registrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
