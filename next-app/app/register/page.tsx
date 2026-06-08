import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
        <div className="bg-white rounded-card shadow-card p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-n-900 mb-1">Create account</h1>
          <p className="text-sm text-n-500 mb-6">Start learning for free today.</p>
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
