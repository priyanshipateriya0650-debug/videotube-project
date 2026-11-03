import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  Play,
  Info,
} from 'lucide-react';
import { getWatchHistory } from '../api/auth.api';
import VideoCard from '../components/video/VideoCard';
import Button from '../components/common/Button';

/**
 * Watch History Page for the authenticated user.
 * Displays user's watched videos recorded by the backend.
 * Conforms to VideoTube's purple light theme.
 */
export default function WatchHistoryPage() {
  const [historyVideos, setHistoryVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch watch history from backend endpoint /api/v1/users/history
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getWatchHistory();
      const list = Array.isArray(res?.data) ? res.data : [];
      setHistoryVideos(list);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load your watch history. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const firstVideo = historyVideos[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center border border-purple-200 shadow-2xs">
            <History className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Watch History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {historyVideos.length} {historyVideos.length === 1 ? 'video' : 'videos'} recorded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {firstVideo && (
            <Link to={`/watch/${firstVideo._id || firstVideo.id}`}>
              <Button variant="primary" size="sm" icon={Play}>
                Resume Watching
              </Button>
            </Link>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchHistory}
            disabled={isLoading}
            title="Refresh watch history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Backend capability notice */}
      <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center gap-2.5 text-xs text-purple-800">
        <Info className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
        <span>
          Videos you watch on VideoTube are automatically saved here. Clear-history functionality is not currently supported by the backend.
        </span>
      </div>

      {/* Loading Skeleton Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col bg-[#F8FAFC] rounded-xl overflow-hidden border border-slate-200 animate-pulse"
            >
              <div className="aspect-video w-full bg-slate-200/80" />
              <div className="p-3.5 space-y-2">
                <div className="h-3.5 bg-slate-200/80 rounded w-4/5" />
                <div className="h-3 bg-slate-200/60 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="max-w-md mx-auto py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">Failed to Load History</h2>
          <p className="text-xs text-slate-600 mt-1">{error}</p>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" size="sm" onClick={fetchHistory}>
              Try Again
            </Button>
          </div>
        </div>
      ) : historyVideos.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200/80 my-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">No Watch History Yet</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
            Videos you watch on VideoTube will automatically appear here so you can easily pick up where you left off.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/">
              <Button variant="primary">Start Watching Videos</Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Video Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {historyVideos.map((video, idx) => (
            <VideoCard key={video._id || idx} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
