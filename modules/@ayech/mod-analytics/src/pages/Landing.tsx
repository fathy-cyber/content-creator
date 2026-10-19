"use client";

import { Box } from "lucide-react";

export default function AnalyticsLanding() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#6366F120" }}
        >
          <Box className="w-5 h-5" style={{ color: "#6366F1" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-500">test module creation.must be removed !</p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
        <p className="text-slate-400">
          Module content will be implemented here.
        </p>
      </div>
    </div>
  );
}
