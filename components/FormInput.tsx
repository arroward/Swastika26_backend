import { motion } from "framer-motion";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
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
  helpText,
  disabled = false,
  min,
  max,
}: FormInputProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={itemVariants} className="mb-6">
      <label
        htmlFor={name}
        className="block text-white/80 text-sm font-medium mb-3"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative group">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          className={`w-full px-5 py-4 rounded-xl bg-white/5 border backdrop-blur-sm transition-all duration-300 text-white placeholder-white/30 outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/10 focus:bg-white/10"
          }`}
        />
        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-red-500 via-white to-red-500 transition-all duration-500 group-focus-within:w-full opacity-0 group-focus-within:opacity-100"></div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
      {helpText && !error && (
        <p className="mt-2 text-xs text-white/50">{helpText}</p>
      )}
    </motion.div>
  );
}
