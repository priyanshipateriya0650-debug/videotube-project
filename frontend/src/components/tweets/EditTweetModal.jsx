import React, { useState } from 'react';
import { X, Edit3, Loader2, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { updateTweet } from '../../api/tweet.api';

/**
 * Modal dialog for editing an existing tweet.
 * Light theme only (#7C3AED, #FFFFFF, #F8FAFC, #0F172A).
 */
export default function EditTweetModal({ isOpen, onClose, tweet, onTweetUpdated }) {
  const [content, setContent] = useState(tweet?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !tweet) return null;

  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Tweet content cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await updateTweet(tweet._id, { content: content.trim() });
      const updated = res?.data;

      if (onTweetUpdated) {
        onTweetUpdated(updated || { ...tweet, content: content.trim() });
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update tweet. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-tweet-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 id="edit-tweet-title" className="text-base font-bold text-[#0F172A]">
              Edit Tweet
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              rows={4}
              maxLength={maxLength}
              required
              className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] text-sm transition-all resize-none leading-relaxed"
            />

            <div className="flex justify-end mt-1 text-[11px] text-slate-400">
              <span className={remainingChars < 20 ? 'text-amber-600 font-semibold' : ''}>
                {remainingChars} characters remaining
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
