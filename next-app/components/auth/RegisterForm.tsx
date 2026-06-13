"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!terms) {
      setError("You must agree to continue");
      return;
    }

    setLoading(true);
    
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
      {error && (
        <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-input px-3.5 py-2.5 mb-1">
          {error}
        </p>
      )}
      
      <Input
        label="Full name"
        type="text"
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
        minLength={6}
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirm password"
        type="password"
        required
        placeholder="Repeat your password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      
      <label className="flex items-start gap-2.5 cursor-pointer mt-1">
        <input 
          type="checkbox" 
          checked={terms} 
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-1 accent-blue-500 w-4 h-4 rounded border-n-300"
        />
        <span className="text-[13px] text-n-600 leading-relaxed">
          I agree to the <Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">Terms of Service</Link> and <Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">Privacy Policy</Link>.
        </span>
      </label>

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full justify-center mt-2 text-base py-3"
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>
      
      <p className="text-[14px] text-n-500 text-center mt-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-700 transition-colors">
          Log in
        </Link>
      </p>
    </form>
  );
}
