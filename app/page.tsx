"use client";

import { useState } from "react";
import { seedEmployees } from "@/lib/seed";
import Link from "next/link";
// import { Button } from "@/components/ui/button"; // Removed unused import
// Wait, I haven't installed shadcn/ui components yet. I should probably do that or just use Tailwind classes directly for now to save time/complexity if not strictly required to use the CLI.
// The prompt said "Styling: Tailwind CSS + shadcn/ui". I should probably install at least the button.
// But for speed in this "Vertical Slice", I can just build a nice button with Tailwind.

export default function Home() {
  const [status, setStatus] = useState<string>("");

  const handleSeed = async () => {
    try {
      setStatus("Initializing...");
      await seedEmployees();
      setStatus("Success! 3 employees added.");
    } catch (error) {
      console.error(error);
      setStatus("Error during initialization.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground gap-8">
      <h1 className="text-4xl font-bold text-primary">Timmy Setup</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={handleSeed}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 px-4 py-2 rounded-md font-medium transition-colors"
        >
          Initialize Tablet (Seed)
        </button>

        {status && <p className="text-center text-sm font-medium text-primary">{status}</p>}

        <div className="h-px bg-gray-200 my-4" />

        <Link href="/kiosk" className="w-full">
          <button className="w-full bg-primary text-white hover:bg-primary/90 h-12 px-4 py-2 rounded-md font-medium transition-colors">
            Open Kiosk
          </button>
        </Link>

        <Link href="/admin" className="w-full">
          <button className="w-full border border-gray-300 hover:bg-gray-100 h-12 px-4 py-2 rounded-md font-medium transition-colors">
            Admin Dashboard
          </button>
        </Link>
      </div>
    </main>
  );
}
