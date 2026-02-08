export interface Admin {
  id: number;
  username: string;
  password: string; // hashed
  role: "superadmin" | "coordinator" | "finance_admin";
  eventId?: string | null; // null for superadmin, specific event ID for coordinator
  fullName: string;
  email: string;
  createdAt?: string;
}

export interface AdminSession {
  id: number;
  username: string;
  role: "superadmin" | "coordinator" | "finance_admin";
  eventId?: string | null;
  fullName: string;
}

export interface RegistrationWithEvent {
  id: number;
  eventId: string;
  eventTitle: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
  registrationDate: string;
}
