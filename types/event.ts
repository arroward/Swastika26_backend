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
}

export interface EventRegistration {
  id?: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
  registrationDate?: string;
}
