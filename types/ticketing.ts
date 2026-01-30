// Swastika 2026 Ticketing System Types

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
export type PurchaseStatus = "ACTIVE" | "CANCELLED";
export type TicketType = "DAY_1" | "DAY_2" | "BOTH_DAYS";
export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED" | "TRANSFERRED";
export type DayType = "DAY_1" | "DAY_2";

export interface Purchase {
    purchaseId: string;           // Primary key: "PUR_xxxxx"
    email: string;                // Buyer email
    phone: string;                // Buyer phone
    name: string;                 // Buyer name
    totalAmount: number;          // Total paid amount
    paymentStatus: PaymentStatus;
    paymentId: string;            // Razorpay/payment gateway ID
    tickets: string[];            // Array of ticket IDs
    purchaseDate: Date;           // Purchase timestamp
    status: PurchaseStatus;
}

export interface ScanRecord {
    day: DayType;
    timestamp: Date;
    scannedBy: string;            // Scanner user ID
    location: string;             // Gate/entrance name
    deviceId: string;             // Scanner device ID
}

export interface Ticket {
    ticketId: string;             // Primary key: "TKT_xxxxx"
    purchaseId: string;           // Foreign key to purchase
    type: TicketType;

    // Ticket holder (optional, can be different from buyer)
    holderName?: string;
    holderEmail?: string;
    holderPhone?: string;

    // QR Code
    qrCode: string;               // Unique hash for QR

    // Scan tracking
    scans: ScanRecord[];

    // Configuration
    allowedDays: DayType[];
    maxScans: number;             // 1 for single day, 2 for both days

    // Status
    status: TicketStatus;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

export interface TicketTypeConfig {
    id: TicketType;
    label: string;
    price: number;
    date: string;
    allowedDays: DayType[];
    maxScans: number;
    color: string;
}

export const TICKET_TYPES: Record<TicketType, TicketTypeConfig> = {
    DAY_1: {
        id: "DAY_1",
        label: "Day 1 Pass",
        price: 50,
        date: "February 14, 2026",
        allowedDays: ["DAY_1"],
        maxScans: 1,
        color: "blue"
    },
    DAY_2: {
        id: "DAY_2",
        label: "Day 2 Pass",
        price: 60,
        date: "February 15, 2026",
        allowedDays: ["DAY_2"],
        maxScans: 1,
        color: "purple"
    },
    BOTH_DAYS: {
        id: "BOTH_DAYS",
        label: "Both Days Pass",
        price: 110,
        date: "Feb 14-15, 2026",
        allowedDays: ["DAY_1", "DAY_2"],
        maxScans: 2,
        color: "red"
    }
};

// API Request/Response Types

export interface CreatePurchaseRequest {
    email: string;
    phone: string;
    name: string;
    tickets: {
        type: TicketType;
        quantity: number;
    }[];
}

export interface CreatePurchaseResponse {
    purchaseId: string;
    totalAmount: number;
    tickets: {
        ticketId: string;
        type: TicketType;
    }[];
    walletUrl: string;
}

export interface VerifyPurchaseRequest {
    purchaseId: string;
    paymentId: string;
    signature: string;
}

export interface VerifyPurchaseResponse {
    success: boolean;
    purchaseId: string;
    status: PaymentStatus;
    sendEmail: boolean;
}

export interface ValidateScanRequest {
    ticketId: string;
    currentDay: DayType;
    scannedBy: string;
    location: string;
    deviceId: string;
}

export interface ValidateScanResponse {
    valid: boolean;
    ticketType?: TicketType;
    holderName?: string;
    remainingScans?: number;
    message: string;
    reason?: "TICKET_NOT_FOUND" | "TICKET_CANCELLED" | "NOT_VALID_FOR_DAY" | "ALREADY_SCANNED" | "TICKET_FULLY_USED";
    scannedAt?: Date;
    location?: string;
}

export interface AdminCancelTicketRequest {
    ticketId: string;
    reason: string;
}

export interface AdminTransferTicketRequest {
    ticketId: string;
    newHolderName: string;
    newHolderEmail: string;
    newHolderPhone?: string;
}

export interface AdminManualScanRequest {
    ticketId: string;
    day: DayType;
    location: string;
    timestamp: Date;
}
