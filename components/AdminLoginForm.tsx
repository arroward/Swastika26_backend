import React, { useState } from "react";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export default function AdminLoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
            Admin Login
          </h1>

          {error && (
            <div className="bg-red-500 text-white p-3 sm:p-4 rounded mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4 sm:mb-5">
              <label
                htmlFor="email"
                className="block text-gray-300 mb-2 text-sm sm:text-base"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <label
                htmlFor="password"
                className="block text-gray-300 mb-2 text-sm sm:text-base"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2.5 sm:py-3 px-4 rounded transition duration-200 text-sm sm:text-base"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
