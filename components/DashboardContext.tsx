"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types based on what we see in the app
type Event = {
    id: string;
    title: string;
};

type Registration = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    collegeName?: string;
    universityName?: string;
    teamSize?: number;
    upiTransactionId?: string;
    accountHolderName?: string;
    uploadFileUrl?: string;
    registrationDate: string;
    eventId: string;
    eventTitle?: string;
    teamMembers?: any;
};

interface DashboardContextType {
    events: Event[];
    registrations: Registration[];

    isEventsLoading: boolean;
    isRegistrationsLoading: boolean;

    eventsError: string | null;
    registrationsError: string | null;

    fetchEvents: (role?: string) => Promise<void>;
    fetchRegistrations: (role?: string, eventId?: string) => Promise<void>;

    invalidateCache: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<Event[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);

    const [isEventsLoading, setIsEventsLoading] = useState(false);
    const [isRegistrationsLoading, setIsRegistrationsLoading] = useState(false);

    const [eventsError, setEventsError] = useState<string | null>(null);
    const [registrationsError, setRegistrationsError] = useState<string | null>(null);

    // Cache flags
    const [hasFetchedEvents, setHasFetchedEvents] = useState(false);
    const [lastFetchedEventId, setLastFetchedEventId] = useState<string | null>(null);

    const fetchEvents = async (role: string = 'superadmin') => {
        // Return early if already fetched
        if (hasFetchedEvents && events.length > 0) return;

        setIsEventsLoading(true);
        setEventsError(null);
        try {
            const url = `/api/admin/events?role=${role}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch events');

            const data = await response.json();
            setEvents(Array.isArray(data) ? data : []);
            setHasFetchedEvents(true);
        } catch (err: any) {
            console.error(err);
            setEventsError(err.message);
        } finally {
            setIsEventsLoading(false);
        }
    };

    const fetchRegistrations = async (role: string = 'superadmin', eventId: string = 'all') => {
        // Smart cache: don't refetch if we already have the data for this specific view
        // Note: A real production app might use a more complex key (role + eventId)
        // Here we just check if we have data and the eventId matches (or we have 'all' which is superset, technically)

        // For simplicity in this "quick fix":
        // If we request 'all', and we have previously fetched 'all', skip.
        // If we request specific event, and we last fetched specific event, skip.
        // Ideally, we'd store a map of fetched parameters.

        if (lastFetchedEventId === eventId && registrations.length > 0) return;

        setIsRegistrationsLoading(true);
        setRegistrationsError(null);
        try {
            let url = `/api/admin/registrations?role=${role}`;
            if (eventId !== "all") {
                url += `&eventId=${eventId}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch registrations");
            }

            setRegistrations(data.success ? data.data : data);
            setLastFetchedEventId(eventId);
        } catch (err: any) {
            console.error(err);
            setRegistrationsError(err.message);
        } finally {
            setIsRegistrationsLoading(false);
        }
    };

    const invalidateCache = () => {
        setHasFetchedEvents(false);
        setLastFetchedEventId(null);
        setEvents([]);
        setRegistrations([]);
    };

    return (
        <DashboardContext.Provider
            value={{
                events,
                registrations,
                isEventsLoading,
                isRegistrationsLoading,
                eventsError,
                registrationsError,
                fetchEvents,
                fetchRegistrations,
                invalidateCache
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
