import crypto from 'crypto';
import { TicketType, DayType, TICKET_TYPES } from '@/types/ticketing';

/**
 * Generate a unique Purchase ID
 * Format: PUR_xxxxx (5 random alphanumeric characters)
 */
export function generatePurchaseId(): string {
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `PUR_${randomStr}`;
}

/**
 * Generate a unique Ticket ID
 * Format: TKT_xxxxx (5 random alphanumeric characters)
 */
export function generateTicketId(): string {
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `TKT_${randomStr}`;
}

/**
 * Generate a unique QR code hash for a ticket
 * Uses SHA256 hash of ticket ID + timestamp + random salt
 */
export function generateQRCode(ticketId: string): string {
    const timestamp = Date.now().toString();
    const salt = crypto.randomBytes(8).toString('hex');
    const data = `${ticketId}:${timestamp}:${salt}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Calculate total amount for ticket purchase
 */
export function calculateTotalAmount(tickets: { type: TicketType; quantity: number }[]): number {
    return tickets.reduce((total, item) => {
        const config = TICKET_TYPES[item.type];
        return total + (config.price * item.quantity);
    }, 0);
}

/**
 * Get allowed days for a ticket type
 */
export function getAllowedDays(ticketType: TicketType): DayType[] {
    return TICKET_TYPES[ticketType].allowedDays;
}

/**
 * Get max scans for a ticket type
 */
export function getMaxScans(ticketType: TicketType): number {
    return TICKET_TYPES[ticketType].maxScans;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Format currency (INR)
 */
export function formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Get ticket type display name
 */
export function getTicketTypeLabel(type: TicketType): string {
    return TICKET_TYPES[type].label;
}

/**
 * Get ticket type color
 */
export function getTicketTypeColor(type: TicketType): string {
    return TICKET_TYPES[type].color;
}

/**
 * Generate QR code URL for display
 */
export function getQRCodeImageUrl(qrCode: string, size: number = 300): string {
    const encodedData = encodeURIComponent(qrCode);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
}

/**
 * Validate QR code format
 */
export function isValidQRCode(qrCode: string): boolean {
    // SHA256 hash is 64 characters long
    return /^[a-f0-9]{64}$/i.test(qrCode);
}

/**
 * Check if a day is valid
 */
export function isValidDay(day: string): day is DayType {
    return day === "DAY_1" || day === "DAY_2";
}

/**
 * Get event date for a day
 */
export function getEventDate(day: DayType): string {
    return day === "DAY_1" ? "February 14, 2026" : "February 15, 2026";
}

/**
 * Check if current date is event day
 */
export function isEventDay(day: DayType): boolean {
    const now = new Date();
    const eventDate = day === "DAY_1"
        ? new Date('2026-02-14')
        : new Date('2026-02-15');

    return now.toDateString() === eventDate.toDateString();
}
