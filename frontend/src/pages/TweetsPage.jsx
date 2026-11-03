import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  RefreshCw,
  Loader2,
  AlertCircle,
  Inbox,
  LogIn,
} from 'lucide-react';
import { getAllTweets } from '../api/tweet.api';
import { useAuth } from '../context/AuthContext';
import CreateTweetBox from '../components/tweets/CreateTweetBox';
import TweetCard from '../components/tweets/TweetCard';
import Button from '../components/common/Button';

/**
 * Community Feed Page displaying all public community tweets.
 * Conforms to VideoTube's purple light theme.
 */
export default function TweetsPage() {
  const { isAuthenticated } = useAuth();

  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Fetch community tweets from backend endpoint GET /api/v1/tweets
  const fetchTweets = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setIsAuthError(true);
      setTweets([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsAuthError(false);
      const res = await getAllTweets({ limit: 50 });
      const items = res?.data?.tweets || res?.data || [];
      setTweets(Array.isArray(items) ? items : []);
    } catch (err) {
      if (err.response?.status === 401) {
        setIsAuthError(true);
      } else {
        setError(
          err.response?.data?.message || 'Failed to load community tweets. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTweets();
    window.scrollTo(0, 0);
  }, [fetchTweets]);

  // Handle new tweet posted
  const handleTweetCreated = (newTweet) => {
    if (newTweet) {
      setTweets((prev) => [newTweet, ...prev]);
    }
  };

  // Handle tweet edited
  const handleTweetUpdated = (updatedTweet) => {
    setTweets((prev) =>
      prev.map((t) => (t._id === updatedTweet._id ? { ...t, ...updatedTweet } : t))
    );
  };

  // Handle tweet deleted
  const handleTweetDeleted = (deletedTweetId) => {
    setTweets((prev) => prev.filter((t) => t._id !== deletedTweetId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center border border-purple-200 shadow-2xs">
            <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Community Tweets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Read updates, thoughts, and announcements from creators across VideoTube
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchTweets}
              disabled={isLoading}
              title="Refresh community feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        )}
      </div>

      {/* Post New Tweet Box */}
      <CreateTweetBox onTweetCreated={handleTweetCreated} />

      {/* Tweets List */}
      <div className="space-y-4 pt-2">
        {isLoading ? (
          /* Loading Skeleton */
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200/80" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-slate-200/80 rounded w-1/4" />
                    <div className="h-2.5 bg-slate-200/60 rounded w-1/6" />
                  </div>
                </div>
                <div className="space-y-2 pt-1 pl-13">
                  <div className="h-3 bg-slate-200/70 rounded w-5/6" />
                  <div className="h-3 bg-slate-200/60 rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : isAuthError || !isAuthenticated ? (
          /* Unauthenticated State */
          <div className="max-w-md mx-auto py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-purple-200/80 my-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
              <LogIn className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Sign in to View Tweets</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
              Sign in with your VideoTube account to see the latest community posts and engage with creators.
            </p>
            <div className="mt-6 flex justify-center">
              <Link to="/login" state={{ from: { pathname: '/tweets' } }}>
                <Button variant="primary" icon={LogIn}>
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="max-w-md mx-auto py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#0F172A]">Failed to Load Tweets</h2>
            <p className="text-xs text-slate-600 mt-1">{error}</p>
            <div className="mt-4 flex justify-center">
              <Button variant="primary" size="sm" onClick={fetchTweets}>
                Try Again
              </Button>
            </div>
          </div>
        ) : tweets.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200/80">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
              <Inbox className="w-8 h-8 text-[#7C3AED]" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">No Community Tweets Yet</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
              Be the first to share a post with the community! Write a message using the form above.
            </p>
          </div>
        ) : (
          /* Tweet Cards */
          <div className="space-y-3.5">
            {tweets.map((tweet) => (
              <TweetCard
                key={tweet._id}
                tweet={tweet}
                onTweetUpdated={handleTweetUpdated}
                onTweetDeleted={handleTweetDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
