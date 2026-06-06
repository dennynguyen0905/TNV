import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
        <div className="bg-white rounded-card shadow-card p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-n-900 mb-1">Welcome back</h1>
          <p className="text-sm text-n-500 mb-6">Log in to continue learning.</p>

          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-n-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="px-3 py-2 text-sm rounded-input border border-n-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-n-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="px-3 py-2 text-sm rounded-input border border-n-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-btn transition-colors mt-2"
            >
              Log in
            </button>
          </form>

          <p className="text-sm text-n-500 text-center mt-4">
            No account?{" "}
            <Link href="/register" className="text-blue-500 hover:text-blue-700 font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
