"use client";

import { motion } from "framer-motion";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  helpText?: string;
}

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  error,
  multiline = false,
  helpText,
}: FormInputProps) {
  return (
    <motion.div
      className="mb-6 group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label
        htmlFor={name}
        className="block text-white/80 text-sm font-medium mb-2 group-focus-within:text-red-400 transition-colors duration-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {multiline ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={4}
            className={`w-full px-5 py-4 rounded-xl bg-white/5 border backdrop-blur-sm transition-all duration-300
              text-white placeholder-white/30 outline-none
              ${
                error
                  ? "border-red-500/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-white/10 hover:border-white/20 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10"
              }`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={`w-full px-5 py-4 rounded-xl bg-white/5 border backdrop-blur-sm transition-all duration-300
              text-white placeholder-white/30 outline-none
              ${
                error
                  ? "border-red-500/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-white/10 hover:border-white/20 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10"
              }`}
          />
        )}

        {/* Animated bottom border/glow */}
        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-red-500 via-white to-red-500 transition-all duration-500 group-focus-within:w-full opacity-0 group-focus-within:opacity-100"></div>
      </div>

      {helpText && !error && (
        <p className="mt-2 text-xs text-white/40 italic">{helpText}</p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 text-sm text-red-500/90 font-medium flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
