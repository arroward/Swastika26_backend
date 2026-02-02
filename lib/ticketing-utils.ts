import crypto from 'crypto';
import { TicketType, DayType, TICKET_TYPES } from '@/types/ticketing';

/**
 * Generate a unique Purchase ID
 * Format: PUR-SX26-XXXX (4 random uppercase characters)
 */
export function generatePurchaseId(): string {
    const randomStr = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `PUR-SX26-${randomStr}`;
}

/**
 * Generate a unique Ticket ID
 * Format: SW26-[TYPE]-[HASH]
 */
export function generateTicketId(type: TicketType): string {
    const typeCode = type === 'DAY_1' ? 'D1' : type === 'DAY_2' ? 'D2' : 'CM';
    const hash = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format: SW26-CM-XXXX-XXXX or similar
    // User example: SW26-CM-XXXX-XXXX
    const sector1 = hash.substring(0, 4);
    const sector2 = hash.substring(4, 8);
    return `SW26-${typeCode}-${sector1}-${sector2}`;
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
