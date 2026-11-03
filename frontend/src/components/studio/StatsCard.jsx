import React from 'react';

/**
 * Metric card component for Creator Studio Dashboard.
 * Clean purple-and-white styling with responsive typography.
 */
export default function StatsCard({ title, value, icon: Icon, subtitle }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          {value !== undefined && value !== null ? value : 0}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
