import { Ticket, DayType, ValidateScanResponse } from '@/types/ticketing';

/**
 * Validate a ticket scan
 * Implements comprehensive validation logic for ticket scanning
 */
export function validateTicketScan(
    ticket: Ticket | null,
    currentDay: DayType
): ValidateScanResponse {
    // 1. Check ticket exists
    if (!ticket) {
        return {
            valid: false,
            reason: "TICKET_NOT_FOUND",
            message: "Ticket not found in the system"
        };
    }

    // 2. Check ticket status
    if (ticket.status === "CANCELLED") {
        return {
            valid: false,
            reason: "TICKET_CANCELLED",
            message: "This ticket has been cancelled"
        };
    }

    if (ticket.status === "TRANSFERRED") {
        return {
            valid: false,
            reason: "TICKET_CANCELLED",
            message: "This ticket has been transferred to another person"
        };
    }

    // 3. Check if valid for this day
    if (!ticket.allowedDays.includes(currentDay)) {
        const validDays = ticket.allowedDays.join(", ");
        return {
            valid: false,
            reason: "NOT_VALID_FOR_DAY",
            message: `This ticket is not valid for ${currentDay}. Valid for: ${validDays}`
        };
    }

    // 4. Check if already scanned for this day
    const dayScans = ticket.scans.filter(s => s.day === currentDay);
    if (dayScans.length > 0) {
        const firstScan = dayScans[0];
        return {
            valid: false,
            reason: "ALREADY_SCANNED",
            message: `This ticket was already scanned for ${currentDay}`,
            scannedAt: firstScan.timestamp,
            location: firstScan.location
        };
    }

    // 5. Check max scans
    if (ticket.scans.length >= ticket.maxScans) {
        return {
            valid: false,
            reason: "TICKET_FULLY_USED",
            message: "This ticket has been fully used (all allowed scans completed)"
        };
    }

    // 6. Valid - return success
    const remainingScans = ticket.maxScans - ticket.scans.length - 1;
    return {
        valid: true,
        ticketType: ticket.type,
        holderName: ticket.holderName || "Guest",
        remainingScans,
        message: `Entry allowed for ${currentDay}. ${remainingScans} scan(s) remaining.`
    };
}

/**
 * Check if a ticket can be cancelled
 */
export function canCancelTicket(ticket: Ticket): { allowed: boolean; reason?: string } {
    if (ticket.status === "CANCELLED") {
        return { allowed: false, reason: "Ticket is already cancelled" };
    }

    if (ticket.status === "USED") {
        return { allowed: false, reason: "Cannot cancel a used ticket" };
    }

    if (ticket.scans.length > 0) {
        return { allowed: false, reason: "Cannot cancel a ticket that has been scanned" };
    }

    return { allowed: true };
}

/**
 * Check if a ticket can be transferred
 */
export function canTransferTicket(ticket: Ticket): { allowed: boolean; reason?: string } {
    if (ticket.status === "CANCELLED") {
        return { allowed: false, reason: "Cannot transfer a cancelled ticket" };
    }

    if (ticket.status === "USED") {
        return { allowed: false, reason: "Cannot transfer a used ticket" };
    }

    if (ticket.scans.length > 0) {
        return { allowed: false, reason: "Cannot transfer a ticket that has been scanned" };
    }

    return { allowed: true };
}

/**
 * Get ticket status display text
 */
export function getTicketStatusText(ticket: Ticket): string {
    if (ticket.status === "CANCELLED") return "Cancelled";
    if (ticket.status === "TRANSFERRED") return "Transferred";
    if (ticket.status === "USED") return "Fully Used";

    if (ticket.scans.length === 0) return "Active - Not Scanned";
    if (ticket.scans.length < ticket.maxScans) return `Partially Used (${ticket.scans.length}/${ticket.maxScans})`;

    return "Fully Used";
}

/**
 * Get scan summary for a ticket
 */
export function getScanSummary(ticket: Ticket): {
    totalScans: number;
    maxScans: number;
    scannedDays: DayType[];
    remainingDays: DayType[];
} {
    const scannedDays = ticket.scans.map(s => s.day);
    const remainingDays = ticket.allowedDays.filter(day => !scannedDays.includes(day));

    return {
        totalScans: ticket.scans.length,
        maxScans: ticket.maxScans,
        scannedDays,
        remainingDays
    };
}
