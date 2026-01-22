export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: string;
  capacity: number;
  registeredCount: number;
  registrationFee?: number; // Optional fee amount, if null or 0 then free
  isOnline: boolean; // true for online events, false for offline
}

export interface EventRegistration {
  id?: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
  registrationDate?: string;
  upiTransactionId?: string; // For paid events
  accountHolderName?: string; // For paid events
  uploadFileUrl?: string; // For online events
}

export type AdminRole = "superadmin" | "event_coordinator";

export interface Admin {
  id: string;
  email: string;
  password: string;
  role: AdminRole;
  name: string;
  eventIds?: string[]; // For event coordinators, which events they manage
  createdAt: string;
}
