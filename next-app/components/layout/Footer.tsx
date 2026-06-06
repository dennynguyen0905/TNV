import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-n-200 bg-white mt-16">
      <div className="max-w-container mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="sm" />
        <p className="text-sm text-n-400">
          © {new Date().getFullYear()} LangPath. Language learning platform.
        </p>
      </div>
    </footer>
  );
}
