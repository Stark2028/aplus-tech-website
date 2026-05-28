"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorCardProps {
  title?: string;
  message?: string;
  reset?: () => void;
  backHref?: string;
  backLabel?: string;
}

export default function ErrorCard({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again or return to the homepage.",
  reset,
  backHref = "/",
  backLabel = "Go home",
}: ErrorCardProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">{message}</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {reset && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-600/20"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          )}
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <ArrowLeft size={15} />
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
