import { Ticket, DayType, ValidateScanResponse, TICKET_TYPES } from '@/types/ticketing';

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
            message: "Invalid Swastika Ticket QR Code"
        };
    }

    // 2. Check ticket status
    if (ticket.status as any === "CANCELLED") {
        return {
            valid: false,
            reason: "TICKET_CANCELLED",
            message: "Invalid Swastika Ticket QR Code"
        };
    }

    const config = TICKET_TYPES[ticket.type];
    const allowedDays = config.allowedDays;
    const maxScans = config.maxScans;

    // 3. Check if valid for this day
    if (!allowedDays.includes(currentDay)) {
        return {
            valid: false,
            reason: "NOT_VALID_FOR_DAY",
            message: "Invalid Swastika Ticket QR Code"
        };
    }

    // 4. Check if already scanned for this day
    const dayScans = ticket.scans.filter(s => s.day === currentDay);
    if (dayScans.length > 0) {
        return {
            valid: false,
            reason: "ALREADY_SCANNED",
            message: "Invalid Swastika Ticket QR Code"
        };
    }

    // 5. Check max scans
    if (ticket.scans.length >= maxScans) {
        return {
            valid: false,
            reason: "TICKET_FULLY_USED",
            message: "Invalid Swastika Ticket QR Code"
        };
    }

    // 6. Valid - return success
    return {
        valid: true,
        ticketType: ticket.type,
        message: `${ticket.ticketId} SCANNED`
    };
}

/**
 * Check if a ticket can be cancelled
 * (Always false for now as status is only ACTIVE or USED)
 */
export function canCancelTicket(ticket: Ticket): { allowed: boolean; reason?: string } {
    if (ticket.status === "USED") {
        return { allowed: false, reason: "Cannot cancel a used ticket" };
    }
    if (ticket.scans.length > 0) {
        return { allowed: false, reason: "Cannot cancel a ticket that has been scanned" };
    }
    return { allowed: true };
}

/**
 * Get ticket status display text
 */
export function getTicketStatusText(ticket: Ticket): string {
    if (ticket.status === "USED") return "Fully Used";
    const config = TICKET_TYPES[ticket.type];
    const maxScans = config.maxScans;

    if (ticket.scans.length === 0) return "Active - Not Scanned";
    if (ticket.scans.length < maxScans) return `Partially Used (${ticket.scans.length}/${maxScans})`;

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
    const config = TICKET_TYPES[ticket.type];
    const scannedDays = ticket.scans.map(s => s.day);
    const remainingDays = config.allowedDays.filter(day => !scannedDays.includes(day));

    return {
        totalScans: ticket.scans.length,
        maxScans: config.maxScans,
        scannedDays,
        remainingDays
    };
}
