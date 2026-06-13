"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push(data.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-input px-3.5 py-2.5">
          {error}
        </p>
      )}
      <Input
        label="Email"
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        required
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex justify-end -mt-2">
        <Link href="#" className="text-[13px] font-medium text-blue-500 hover:text-blue-700 transition-colors">
          Forgot password?
        </Link>
      </div>
      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full justify-center mt-1 text-base py-3"
      >
        {loading ? "Logging in..." : "Log in"}
      </Button>
      <p className="text-[14px] text-n-500 text-center mt-2">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-blue-500 hover:text-blue-700 transition-colors">
          Create one
        </Link>
      </p>
    </form>
  );
}
