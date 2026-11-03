import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, Loader2, AlertCircle, MessageSquare, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createTweet } from '../../api/tweet.api';
import Button from '../common/Button';

/**
 * Box component for creating and posting community tweets.
 * Conforms to VideoTube's purple light theme.
 */
export default function CreateTweetBox({ onTweetCreated }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/tweets' } } });
      return;
    }

    if (!content.trim()) {
      setError('Please write something before posting.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await createTweet({ content: content.trim() });
      const createdTweet = res?.data;

      // Enhance with current user info if not populated by backend
      const fullTweet = {
        ...createdTweet,
        owner: createdTweet?.owner?._id
          ? createdTweet.owner
          : {
              _id: user?._id,
              username: user?.username,
              fullName: user?.fullName,
              avatar: user?.avatar,
            },
        likesCount: 0,
        isLiked: false,
      };

      if (onTweetCreated) {
        onTweetCreated(fullTweet);
      }

      setContent('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to post tweet. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unauthenticated State Banner
  if (!isAuthenticated) {
    return (
      <div className="bg-[#F8FAFC] border border-purple-200/80 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center flex-shrink-0 border border-purple-200">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Join the Conversation
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-md">
              Sign in to post community updates, like creator tweets, and connect with other viewers.
            </p>
          </div>
        </div>

        <Link to="/login" state={{ from: { pathname: '/tweets' } }}>
          <Button variant="primary" icon={LogIn} className="whitespace-nowrap">
            Sign In to Post
          </Button>
        </Link>
      </div>
    );
  }

  // Authenticated Create Tweet Form
  return (
    <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-start gap-3.5">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName || user.username}
              className="w-10 h-10 rounded-full object-cover border border-purple-200 shadow-2xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-sm border border-purple-200">
              {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Text Input Area */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update with the VideoTube community..."
            rows={3}
            maxLength={maxLength}
            className="w-full bg-white text-[#0F172A] placeholder-slate-400 p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] text-sm transition-all resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-xs ${
                remainingChars < 20
                  ? 'text-amber-600 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {remainingChars} characters left
            </span>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !content.trim()}
              icon={Send}
            >
              {isSubmitting ? 'Posting...' : 'Post Tweet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
