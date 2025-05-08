
import { ReactNode } from "react";
import Navbar from "./Navbar";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container px-4 py-6 mx-auto">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-gray-500 border-t">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Attendify - Attendance Monitoring System
        </div>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
}
