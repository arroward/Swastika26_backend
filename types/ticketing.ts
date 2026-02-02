// Swastika 2026 Ticketing System Types

export type PurchaseStatus = "COMPLETED" | "PENDING";
export type TicketStatus = "ACTIVE" | "USED";
export type TicketType = "DAY_1" | "DAY_2" | "COMBO";
export type DayType = "DAY_1" | "DAY_2";

export interface Purchase {
  purchaseId: string; // Primary key: "PUR-SX26-XXXX"
  name?: string;
  email: string;
  phone: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  totalAmount: number;
  purchaseDate: Date | any; // Using any for Firestore Timestamp support
  status: PurchaseStatus;
  paymentStatus?: string;
  paymentId?: string;
  tickets?: string[];
}

export interface ScanRecord {
  day: DayType;
  timestamp: Date | any;
  gate?: string;
  scannedBy?: string;
  location?: string;
  deviceId?: string;
}

export interface Ticket {
  ticketId: string; // SW26-[TYPE]-[HASH]
  purchaseId: string; // Links to the purchase record
  type: TicketType;
  qrHash: string; // Exact same as ticketId
  status: TicketStatus;
  scans: ScanRecord[];
  holderName?: string;
  holderEmail?: string;
  holderPhone?: string;
  qrCode?: string;
  allowedDays?: DayType[];
  maxScans?: number;
  createdAt?: Date;
  updatedAt?: Date;
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
    date: "February 21, 2026",
    allowedDays: ["DAY_1"],
    maxScans: 1,
    color: "blue",
  },
  DAY_2: {
    id: "DAY_2",
    label: "Day 2 Pass",
    price: 60,
    date: "February 22, 2026",
    allowedDays: ["DAY_2"],
    maxScans: 1,
    color: "purple",
  },
  COMBO: {
    id: "COMBO",
    label: "Combo Pass",
    price: 110,
    date: "Feb 21-22, 2026",
    allowedDays: ["DAY_1", "DAY_2"],
    maxScans: 2,
    color: "red",
  },
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
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  totalAmount: number;
  tickets: {
    type: TicketType;
    quantity: number;
  }[];
  paymentId: string;
  signature: string;
}

export interface VerifyPurchaseResponse {
  success: boolean;
  purchaseId: string;
  status: PurchaseStatus;
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
  reason?:
    | "TICKET_NOT_FOUND"
    | "TICKET_CANCELLED"
    | "NOT_VALID_FOR_DAY"
    | "ALREADY_SCANNED"
    | "TICKET_FULLY_USED";
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
