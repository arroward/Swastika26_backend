"use client";

import React from "react";
import Link from "next/link";

// Mock Event type for demonstration
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: string;
  isOnline: boolean;
  registrationFee?: number;
  capacity: number;
  registeredCount: number;
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const formattedId = event.id.padStart(3, "0");

  return (
    <Link
      href={`/${event.id}/register`}
      className="group relative bg-black rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer aspect-[3/4] max-w-sm block"
    >
      {/* Event Image */}
      <div className="relative w-full h-full">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
        />

        {/* Hover overlay with event details */}
        <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8">
          <div className="text-white space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-2xl font-bold">{event.title}</h3>
            <p className="text-gray-300 text-sm line-clamp-3">
              {event.description}
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-cyan-400">
                📅{" "}
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-cyan-400">📍 {event.location}</p>
              <p className="text-cyan-400">
                {event.registrationFee && event.registrationFee > 0
                  ? `💰 ₹${event.registrationFee}`
                  : "🎉 Free"}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/${event.id}/register`;
              }}
              className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
