import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import Button from '../components/common/Button';

/**
 * PlaceholderPage:
 * Displays a clean, styled light-theme page for sections planned for future phases.
 */
export default function PlaceholderPage({ title, description, badge = 'Phase 2+ Feature' }) {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
        <Clock className="w-7 h-7" />
      </div>
      <div className="inline-block px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold mb-3">
        {badge}
      </div>
      <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
        {title}
      </h1>
      <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Link to="/">
          <Button variant="primary" icon={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
