"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "./FormInput";
import { Event } from "@/types/event";

interface EventRegistrationFormProps {
  event: Event;
}

export default function EventRegistrationForm({
  event,
}: EventRegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeName: "",
    universityName: "",
    teamSize: 0,
    teamMembers: [] as string[],
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeName: "",
    universityName: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "teamSize") {
      const size = Math.max(parseInt(value) || 1, 1);
      // For team size n, we need n-1 additional member fields (excluding the main registrant)
      const newTeamMembers = Array(Math.max(size - 1, 0))
        .fill("")
        .map((_, i) => formData.teamMembers[i] || "");
      setFormData((prev) => ({
        ...prev,
        teamSize: size,
        teamMembers: newTeamMembers,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTeamMemberChange = (index: number, value: string) => {
    const newTeamMembers = [...formData.teamMembers];
    newTeamMembers[index] = value;
    setFormData((prev) => ({ ...prev, teamMembers: newTeamMembers }));
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      collegeName: "",
      universityName: "",
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = "College name is required";
    }

    if (!formData.universityName.trim()) {
      newErrors.universityName = "University name is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card-border rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4 border border-green-600/30">
          <svg
            className="w-8 h-8 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Registration Successful!
        </h2>
        <p className="text-white/80 mb-6">
          You have successfully registered for{" "}
          <span className="font-semibold">{event.title}</span>
        </p>
        <p className="text-sm text-white/60">Redirecting you back to home...</p>
      </div>
    );
  }

  return (
    <div className="card-border rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Register for Event</h2>

      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-600/50 text-red-200 px-4 py-3 rounded-lg flex items-start backdrop-blur-sm">
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          placeholder="John Doe"
          error={errors.fullName}
        />

        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="john.doe@example.com"
          error={errors.email}
        />

        <FormInput
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="+1 (555) 123-4567"
          error={errors.phone}
        />

        <FormInput
          label="College Name"
          name="collegeName"
          value={formData.collegeName}
          onChange={handleChange}
          required
          placeholder="Your college name"
          error={errors.collegeName}
        />

        <FormInput
          label="University Name"
          name="universityName"
          value={formData.universityName}
          onChange={handleChange}
          required
          placeholder="Your university name"
          error={errors.universityName}
        />

        <div className="mb-6">
          <label
            htmlFor="teamSize"
            className="block text-red-200 font-semibold mb-2"
          >
            Number of Team Members
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            id="teamSize"
            name="teamSize"
            min="1"
            max="10"
            value={formData.teamSize}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg glass border border-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all text-white placeholder-red-300/50"
          />
          <p className="mt-1 text-sm text-white/60">Including yourself</p>
        </div>

        {formData.teamSize > 1 && (
          <div className="mb-6">
            <label className="block text-red-200 font-semibold mb-2">
              Team Member Names (excluding yourself)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-3">
              {formData.teamMembers.map((member, index) => (
                <input
                  key={index}
                  type="text"
                  value={member}
                  onChange={(e) =>
                    handleTeamMemberChange(index, e.target.value)
                  }
                  placeholder={`Team Member ${index + 1} Name`}
                  required
                  className="w-full px-4 py-3 rounded-lg glass border border-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all text-white placeholder-red-300/50"
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <h3 className="font-semibold text-white mb-2">Event Details</h3>
          <div className="space-y-1 text-sm text-white/70">
            <p>
              <span className="font-medium">Event:</span> {event.title}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p>
              <span className="font-medium">Location:</span> {event.location}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600/80 hover:bg-red-600 backdrop-blur-sm text-white py-4 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-red-500/50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </>
          ) : (
            "Complete Registration"
          )}
        </button>
      </form>
    </div>
  );
}
