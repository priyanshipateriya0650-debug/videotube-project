import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Flame,
  Search,
  AlertCircle,
  RotateCcw,
  LogIn,
  VideoOff,
  X,
  Loader2,
} from 'lucide-react';
import { getAllVideos } from '../api/video.api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/video/VideoCard';
import VideoCardSkeleton from '../components/video/VideoCardSkeleton';
import Button from '../components/common/Button';

const PAGE_LIMIT = 12;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const { isAuthenticated } = useAuth();

  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Fetch initial videos or new search results (page 1)
  const fetchVideos = useCallback(async (query = '') => {
    try {
      setIsLoading(true);
      setError(null);
      setIsAuthError(false);
      setPage(1);

      const params = {
        page: 1,
        limit: PAGE_LIMIT,
      };

      if (query.trim()) {
        params.query = query.trim();
      }

      const res = await getAllVideos(params);
      const list = Array.isArray(res?.data) ? res.data : [];

      setVideos(list);
      setHasMore(list.length === PAGE_LIMIT);
    } catch (err) {
      if (err.response?.status === 401) {
        setIsAuthError(true);
      } else {
        setError(
          err.response?.data?.message ||
            'Unable to load videos. Please check your internet connection or server status.'
        );
      }
      setVideos([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger fetch when search query or authentication state changes
  useEffect(() => {
    fetchVideos(searchQuery);
  }, [fetchVideos, searchQuery, isAuthenticated]);

  // Load next page
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const params = {
        page: nextPage,
        limit: PAGE_LIMIT,
      };

      if (searchQuery.trim()) {
        params.query = searchQuery.trim();
      }

      const res = await getAllVideos(params);
      const newVideos = Array.isArray(res?.data) ? res.data : [];

      setVideos((prev) => [...prev, ...newVideos]);
      setPage(nextPage);
      setHasMore(newVideos.length === PAGE_LIMIT);
    } catch (err) {
      console.error('Failed to load more videos:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleClearSearch = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Feed / Search Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          {searchQuery ? (
            <>
              <Search className="w-5 h-5 text-[#7C3AED]" />
              <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Search results for &ldquo;{searchQuery}&rdquo;
              </h1>
            </>
          ) : (
            <>
              <Flame className="w-5 h-5 text-[#7C3AED]" />
              <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Recommended Videos
              </h1>
            </>
          )}
        </div>

        {/* Clear Search shortcut if searching */}
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] hover:bg-[#EDE9FE] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear Search
          </button>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <VideoCardSkeleton key={idx} />
          ))}
        </div>
      ) : isAuthError && !isAuthenticated ? (
        /* Authentication Required State */
        <div className="max-w-md mx-auto py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Sign in to view your feed</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
            VideoTube requires you to be signed in to access published videos, creator content, and recommendations.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login">
              <Button variant="primary" icon={LogIn}>
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Create Account</Button>
            </Link>
          </div>
        </div>
      ) : error ? (
        /* Error State with Retry Button */
        <div className="max-w-md mx-auto py-16 px-4 text-center bg-red-50/50 rounded-2xl border border-red-200">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">Failed to Load Videos</h2>
          <p className="text-xs text-red-700 mt-2 max-w-sm mx-auto">{error}</p>
          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              icon={RotateCcw}
              onClick={() => fetchVideos(searchQuery)}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : videos.length === 0 ? (
        /* Empty Results State */
        <div className="max-w-md mx-auto py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-slate-200/80 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-300">
            <VideoOff className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">
            {searchQuery ? 'No matching videos found' : 'No videos available yet.'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find any videos matching "${searchQuery}". Try different keywords or clear your search.`
              : 'Be the first creator to upload a video to VideoTube!'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {searchQuery ? (
              <Button variant="outline" onClick={handleClearSearch}>
                Clear Search
              </Button>
            ) : (
              <Link to="/studio">
                <Button variant="primary">Upload Video</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Real Video Cards Grid */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Load More Pagination Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 text-sm font-semibold border-slate-300 hover:border-purple-300"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
                    Loading More Videos...
                  </span>
                ) : (
                  'Load More Videos'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
