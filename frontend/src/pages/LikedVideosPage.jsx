import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  Play,
  HeartOff,
  Trash2,
} from 'lucide-react';
import { getLikedVideos, toggleVideoLike } from '../api/like.api';
import VideoCard from '../components/video/VideoCard';
import Button from '../components/common/Button';

/**
 * Liked Videos Page for the authenticated user.
 * Fetches and displays videos liked by the current user.
 * Follows VideoTube's purple light theme.
 */
export default function LikedVideosPage() {
  const [likedList, setLikedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlikingVideoId, setUnlikingVideoId] = useState(null);

  // Fetch liked videos from backend
  const fetchLikedVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getLikedVideos();
      // Handle response structure: { likedVideos: [ { video: { _id, title, ... } } ] }
      const items = res?.data?.likedVideos || res?.data || [];
      setLikedList(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load liked videos. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLikedVideos();
  }, [fetchLikedVideos]);

  // Handle removing a like directly from this page
  const handleUnlike = async (videoId) => {
    if (!videoId || unlikingVideoId) return;

    try {
      setUnlikingVideoId(videoId);
      await toggleVideoLike(videoId);
      setLikedList((prev) =>
        prev.filter((item) => (item.video?._id || item._id) !== videoId)
      );
    } catch (err) {
      console.error('Failed to unlike video:', err);
    } finally {
      setUnlikingVideoId(null);
    }
  };

  // Extract clean video objects for rendering
  const videos = likedList
    .map((item) => {
      if (!item) return null;
      const v = item.video || item;
      return {
        ...v,
        _likeId: item._id,
      };
    })
    .filter(Boolean);

  const firstVideo = videos[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center border border-purple-200 shadow-2xs">
            <ThumbsUp className="w-5 h-5 fill-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Liked Videos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'} you have liked
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {firstVideo && (
            <Link to={`/watch/${firstVideo._id || firstVideo.id}`}>
              <Button variant="primary" size="sm" icon={Play}>
                Play All
              </Button>
            </Link>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLikedVideos}
            disabled={isLoading}
            title="Refresh liked videos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
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
          <h2 className="text-base font-bold text-[#0F172A]">Failed to Load Liked Videos</h2>
          <p className="text-xs text-slate-600 mt-1">{error}</p>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" size="sm" onClick={fetchLikedVideos}>
              Try Again
            </Button>
          </div>
        </div>
      ) : videos.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200/80 my-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
            <HeartOff className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">No Liked Videos Yet</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
            Videos you tap the thumbs-up button on will automatically be saved to this personal library.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/">
              <Button variant="primary">Browse Videos</Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Video Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {videos.map((video) => {
            const videoId = video._id || video.id;
            const isUnliking = unlikingVideoId === videoId;

            return (
              <div key={video._likeId || videoId} className="relative group">
                <VideoCard video={video} />

                {/* Quick Unlike Overlay Button */}
                <button
                  type="button"
                  onClick={() => handleUnlike(videoId)}
                  disabled={isUnliking}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                  title="Remove from liked videos"
                  aria-label="Remove from liked videos"
                >
                  {isUnliking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
