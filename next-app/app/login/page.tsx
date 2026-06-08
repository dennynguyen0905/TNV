import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
        <div className="bg-white rounded-card shadow-card p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-n-900 mb-1">Welcome back</h1>
          <p className="text-sm text-n-500 mb-6">Log in to continue learning.</p>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
