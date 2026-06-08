"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-input px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-n-700">Name</label>
        <input
          name="name"
          type="text"
          required
          placeholder="Your name"
          className="px-3 py-2 text-sm rounded-input border border-n-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-n-700">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="px-3 py-2 text-sm rounded-input border border-n-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-n-700">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          className="px-3 py-2 text-sm rounded-input border border-n-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
        />
        <p className="text-xs text-n-400">Minimum 8 characters</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-btn transition-colors"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-sm text-n-500 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:text-blue-700 font-medium">
          Log in
        </Link>
      </p>
    </form>
  );
}
