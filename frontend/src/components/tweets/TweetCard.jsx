import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toggleTweetLike, deleteTweet } from '../../api/tweet.api';
import EditTweetModal from './EditTweetModal';
import { formatRelativeTime, formatViews } from '../../utils/formatters';

/**
 * TweetCard displaying tweet author, content, timestamp, like toggle, and owner controls.
 * Conforms to VideoTube's purple light theme.
 */
export default function TweetCard({ tweet, onTweetUpdated, onTweetDeleted }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(Boolean(tweet.isLiked));
  const [likesCount, setLikesCount] = useState(Number(tweet.likesCount) || 0);
  const [isLiking, setIsLiking] = useState(false);

  // Dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Author details
  const owner = tweet.owner || {};
  const authorName = owner.fullName || owner.username || 'VideoTube Creator';
  const authorUsername = owner.username;
  const authorAvatar = owner.avatar;

  // Check ownership
  const isOwner =
    user &&
    (owner._id === user._id ||
      tweet.owner === user._id ||
      owner.toString?.() === user._id?.toString?.());

  // Handle Like Toggle
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/tweets' } } });
      return;
    }
    if (isLiking) return;

    try {
      setIsLiking(true);
      await toggleTweetLike(tweet._id);
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    } catch (err) {
      console.error('Failed to toggle tweet like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle Delete Tweet
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this tweet? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setIsMenuOpen(false);
      await deleteTweet(tweet._id);
      if (onTweetDeleted) {
        onTweetDeleted(tweet._id);
      }
    } catch (err) {
      console.error('Failed to delete tweet:', err);
      alert('Failed to delete tweet. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-[#F8FAFC] hover:bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 hover:border-purple-200 transition-all duration-150 space-y-3.5 shadow-2xs hover:shadow-sm">
        {/* Author Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            {authorUsername ? (
              <Link to={`/c/${authorUsername}`} className="flex-shrink-0">
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-10 h-10 rounded-full object-cover border border-purple-200 hover:ring-2 hover:ring-[#7C3AED]/30 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-sm border border-purple-200">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-sm border border-purple-200 flex-shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Author info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {authorUsername ? (
                  <Link
                    to={`/c/${authorUsername}`}
                    className="text-sm font-bold text-[#0F172A] hover:text-[#7C3AED] transition-colors truncate"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="text-sm font-bold text-[#0F172A] truncate">
                    {authorName}
                  </span>
                )}

                {authorUsername && (
                  <span className="text-xs text-slate-400 truncate">
                    @{authorUsername}
                  </span>
                )}

                <span className="text-slate-300 text-xs">&bull;</span>

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  {tweet.createdAt ? formatRelativeTime(tweet.createdAt) : 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Actions Menu */}
          {isOwner && (
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tweet actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-8 z-30 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-[#EDE9FE] hover:text-[#7C3AED] text-left cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Tweet</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 text-left cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tweet Content */}
        <div className="pl-0 sm:pl-13 text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap break-words">
          {tweet.content}
        </div>

        {/* Footer Actions: Like Toggle */}
        <div className="pl-0 sm:pl-13 pt-1 flex items-center gap-4">
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border
              ${
                isLiked
                  ? 'bg-[#EDE9FE] text-[#7C3AED] border-purple-300'
                  : 'bg-white text-slate-600 hover:bg-[#EDE9FE] hover:text-[#7C3AED] border-slate-200'
              }
            `}
            aria-label="Like tweet"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isLiked ? 'fill-[#7C3AED] text-[#7C3AED]' : 'text-slate-400'
              }`}
            />
            <span>{formatViews(likesCount)}</span>
          </button>
        </div>
      </div>

      {/* Edit Tweet Modal */}
      {isEditModalOpen && (
        <EditTweetModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          tweet={tweet}
          onTweetUpdated={onTweetUpdated}
        />
      )}
    </>
  );
}
