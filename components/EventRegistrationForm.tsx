"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeName: "",
    universityName: "",
    teamSize: 0,
    teamMembers: [] as string[],
    upiTransactionId: "",
    accountHolderName: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeName: "",
    universityName: "",
    upiTransactionId: "",
    accountHolderName: "",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File size must be less than 10MB");
        setUploadedFile(null);
        return;
      }

      // Validate file type (pdf, doc, docx, images)
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (!allowedTypes.includes(file.type)) {
        setFileError("Only PDF, DOC, DOCX, JPG, and PNG files are allowed");
        setUploadedFile(null);
        return;
      }

      setUploadedFile(file);
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      phone: "",
      collegeName: "",
      universityName: "",
      upiTransactionId: "",
      accountHolderName: "",
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

    // Validate payment fields if event has registration fee
    const hasRegistrationFee =
      event.registrationFee && event.registrationFee > 0;
    if (hasRegistrationFee) {
      if (!formData.upiTransactionId.trim()) {
        newErrors.upiTransactionId = "UPI Transaction ID is required";
      }

      if (!formData.accountHolderName.trim()) {
        newErrors.accountHolderName = "Account holder name is required";
      }
    }

    // Validate file upload for online events
    if (event.isOnline && !uploadedFile) {
      setFileError("File upload is required for online events");
      setErrors(newErrors);
      return false;
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
      // Prepare form data with file if needed
      const submitData = new FormData();
      submitData.append("eventId", event.id);
      submitData.append("fullName", formData.fullName);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("collegeName", formData.collegeName);
      submitData.append("universityName", formData.universityName);
      submitData.append("teamSize", formData.teamSize.toString());
      submitData.append("teamMembers", JSON.stringify(formData.teamMembers));

      if (formData.upiTransactionId) {
        submitData.append("upiTransactionId", formData.upiTransactionId);
      }
      if (formData.accountHolderName) {
        submitData.append("accountHolderName", formData.accountHolderName);
      }

      // Add file for online events
      if (event.isOnline && uploadedFile) {
        submitData.append("file", uploadedFile);
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: submitData,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-red-900/40 to-black/60 backdrop-blur-xl border border-red-500/30 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 1, delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full mb-6 border-4 border-red-500/20 shadow-lg shadow-red-600/20"
        >
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-4"
        >
          Registration Successful!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/80 mb-8 text-lg"
        >
          You have successfully registered for{" "}
          <span className="font-semibold text-white">{event.title}</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-white/50 font-medium"
        >
          Redirecting you back to home...
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative bg-gradient-to-br from-red-900/10 to-black/40 backdrop-blur-xl rounded-3xl border border-red-500/10 p-8 md:p-10 shadow-2xl overflow-hidden"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
          Register for Event
        </h2>
        <p className="text-white/50 text-sm">
          Please fill out the form below to secure your spot.
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, mb: 0 }}
            animate={{ opacity: 1, height: "auto", mb: 24 }}
            exit={{ opacity: 0, height: 0, mb: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-100 px-6 py-4 rounded-xl flex items-start backdrop-blur-md"
          >
            <svg
              className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-2">
        <FormInput
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          placeholder="Enter your full name"
          error={errors.fullName}
        />

        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="email@example.com"
          error={errors.email}
        />

        <FormInput
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="+91 98765 43210"
          error={errors.phone}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="College Name"
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            required
            placeholder="Your college"
            error={errors.collegeName}
          />

          <FormInput
            label="University Name"
            name="universityName"
            value={formData.universityName}
            onChange={handleChange}
            required
            placeholder="Your university"
            error={errors.universityName}
          />
        </div>

        <motion.div variants={itemVariants} className="mb-6 pt-4">
          <label
            htmlFor="teamSize"
            className="block text-white/80 text-sm font-medium mb-3"
          >
            Number of Team Members
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative group">
            <input
              type="number"
              id="teamSize"
              name="teamSize"
              min="1"
              max="10"
              value={formData.teamSize}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 text-white placeholder-white/30 outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10"
            />
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-red-500 via-white to-red-500 transition-all duration-500 group-focus-within:w-full opacity-0 group-focus-within:opacity-100"></div>
          </div>
          <p className="mt-2 text-xs text-white/40 italic">
            Including yourself (Leader + Members)
          </p>
        </motion.div>

        <AnimatePresence>
          {formData.teamSize > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 pl-4 border-l-2 border-white/5"
            >
              <label className="block text-white/90 font-semibold mb-4 text-sm uppercase tracking-wider">
                Team Member Names
              </label>
              <div className="space-y-4">
                {formData.teamMembers.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <label className="block text-white/60 text-xs mb-1.5 ml-1">
                      Member {index + 1}
                    </label>
                    <input
                      type="text"
                      value={member}
                      onChange={(e) =>
                        handleTeamMemberChange(index, e.target.value)
                      }
                      placeholder={`Enter name of team member ${index + 1}`}
                      required
                      className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm focus:outline-none focus:border-red-500/40 focus:bg-white/10 transition-all text-white placeholder-white/20 text-sm"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Section */}
        {event.registrationFee && event.registrationFee > 0 && (
          <motion.div
            variants={itemVariants}
            className="mb-8 mt-8 p-6 bg-gradient-to-br from-red-900/20 to-red-950/30 border border-red-500/20 rounded-2xl backdrop-blur-sm"
          >
            <h3 className="font-bold text-white mb-4 flex items-center text-lg">
              <div className="p-2 bg-red-500/20 rounded-lg mr-3">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              Payment Details
            </h3>
            <div className="mb-6 p-4 bg-black/20 rounded-xl border border-red-500/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70 text-sm">Registration Fee</span>
                <span className="text-xl font-bold text-white">
                  ₹{event.registrationFee}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Please complete payment via UPI and enter details below
              </p>
            </div>

            <div className="space-y-2">
              <FormInput
                label="UPI Transaction ID"
                name="upiTransactionId"
                value={formData.upiTransactionId}
                onChange={handleChange}
                required
                placeholder="12 digit transaction ID"
                error={errors.upiTransactionId}
                helpText="Reference ID from your payment app"
              />

              <FormInput
                label="Account Holder Name"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                required
                placeholder="Name as per bank/UPI"
                error={errors.accountHolderName}
                helpText="Name of the person who made the payment"
              />
            </div>
          </motion.div>
        )}

        {/* File Upload Section */}
        {event.isOnline && (
          <motion.div
            variants={itemVariants}
            className="mb-8 mt-8 p-6 bg-gradient-to-br from-red-900/20 to-red-950/30 border border-red-500/20 rounded-2xl backdrop-blur-sm"
          >
            <h3 className="font-bold text-white mb-4 flex items-center text-lg">
              <div className="p-2 bg-red-500/20 rounded-lg mr-3">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              Document Upload
            </h3>

            <div className="mb-6">
              <label
                htmlFor="fileUpload"
                className="block text-white/80 text-sm font-medium mb-3"
              >
                Submission File
                <span className="text-red-500 ml-1">*</span>
              </label>

              <div className="relative group">
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-5 py-4 rounded-xl bg-black/20 border border-red-500/20 hover:bg-red-900/10 transition-all text-sm text-gray-300
                    file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 
                    file:text-sm file:font-semibold file:bg-red-600 file:text-white 
                    hover:file:bg-red-700 cursor-pointer"
                />
              </div>

              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center p-3 bg-red-600/10 rounded-lg border border-red-500/20 text-white text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
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
                  <span>
                    {uploadedFile.name}{" "}
                    <span className="opacity-50 ml-1">
                      ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </span>
                </motion.div>
              )}
              {fileError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-400 flex items-center font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {fileError}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center border border-red-500/50 shadow-lg shadow-red-600/20"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite]"></div>

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
                Processing Registration...
              </>
            ) : (
              <span className="flex items-center gap-2">
                Confirm Registration
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
