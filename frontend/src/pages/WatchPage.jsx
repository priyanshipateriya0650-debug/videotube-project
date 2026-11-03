import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ThumbsUp,
  Share2,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserPlus,
  ListPlus,
} from 'lucide-react';
import { getVideoById, getAllVideos } from '../api/video.api';
import { toggleVideoLike } from '../api/like.api';
import { toggleSubscription } from '../api/subscription.api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/video/VideoPlayer';
import CommentSection from '../components/comments/CommentSection';
import AddToPlaylistModal from '../components/playlist/AddToPlaylistModal';
import Button from '../components/common/Button';
import {
  formatViews,
  formatRelativeTime,
  formatDuration,
} from '../utils/formatters';

export default function WatchPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Likes state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Subscription state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Description expand/collapse state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Share feedback state
  const [isCopied, setIsCopied] = useState(false);

  // Playlist modal state
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // Recommended videos state
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Fetch current video details
  const fetchVideoDetails = useCallback(async () => {
    if (!videoId) return;

    try {
      setIsLoading(true);
      setError(null);

      const res = await getVideoById(videoId);
      const data = res?.data;

      if (data) {
        setVideo(data);
        setIsLiked(Boolean(data.isLiked));
        setLikesCount(Number(data.likesCount) || 0);

        if (data.owner) {
          setIsSubscribed(Boolean(data.owner.isSubscribed));
          setSubscribersCount(Number(data.owner.subscribersCount) || 0);
        }
      } else {
        setError('Video not found.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication required: please sign in to watch this video.');
      } else if (err.response?.status === 404) {
        setError('The video you are looking for does not exist or has been removed.');
      } else {
        setError(err.response?.data?.message || 'Failed to load video.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  // Fetch recommended videos
  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoadingRecs(true);
      const res = await getAllVideos({ limit: 12 });
      const list = Array.isArray(res?.data) ? res.data : [];
      // Filter out the current active video
      setRecommendedVideos(list.filter((v) => v._id !== videoId));
    } catch (err) {
      // Catch silently (e.g. 401 if unauthenticated) so player still functions
      setRecommendedVideos([]);
    } finally {
      setIsLoadingRecs(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchVideoDetails();
    fetchRecommendations();
    window.scrollTo(0, 0);
  }, [fetchVideoDetails, fetchRecommendations]);

  // Toggle Video Like
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/watch/${videoId}` } } });
      return;
    }
    if (isLiking) return;

    try {
      setIsLiking(true);
      await toggleVideoLike(videoId);
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  // Toggle Channel Subscription
  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/watch/${videoId}` } } });
      return;
    }
    if (!video?.owner?._id || isSubscribing) return;

    try {
      setIsSubscribing(true);
      await toggleSubscription(video.owner._id);
      setIsSubscribed((prev) => !prev);
      setSubscribersCount((prev) =>
        isSubscribed ? Math.max(0, prev - 1) : prev + 1
      );
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Copy share URL to clipboard
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Open playlist modal
  const handleOpenPlaylistModal = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/watch/${videoId}` } } });
      return;
    }
    setIsPlaylistModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading video...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#0F172A]">Unable to Play Video</h1>
        <p className="text-slate-600 text-sm mt-2">{error || 'Video is unavailable.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          {error?.includes('sign in') ? (
            <Link to="/login">
              <Button variant="primary">Sign In Now</Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="primary">Back to Home</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const isOwner = user && video.owner?._id === user._id;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Player, Video Info, Comments (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          {/* HTML5 Video Player */}
          <VideoPlayer
            src={video.videoFile}
            poster={video.thumbnail}
            title={video.title}
          />

          {/* Video Title */}
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] leading-snug">
            {video.title}
          </h1>

          {/* Channel Info & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            {/* Channel Details */}
            <div className="flex items-center gap-3">
              <Link to={`/c/${video.owner?.username}`}>
                {video.owner?.avatar ? (
                  <img
                    src={video.owner.avatar}
                    alt={video.owner.username}
                    className="w-11 h-11 rounded-full object-cover border border-purple-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-sm">
                    {video.owner?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </Link>

              <div>
                <Link
                  to={`/c/${video.owner?.username}`}
                  className="font-bold text-sm text-[#0F172A] hover:text-[#7C3AED] transition-colors block"
                >
                  {video.owner?.fullName || video.owner?.username}
                </Link>
                <p className="text-xs text-slate-500">
                  {subscribersCount} {subscribersCount === 1 ? 'subscriber' : 'subscribers'}
                </p>
              </div>

              {/* Subscribe Button */}
              {!isOwner && (
                <div className="ml-2">
                  <Button
                    size="sm"
                    variant={isSubscribed ? 'secondary' : 'primary'}
                    onClick={handleToggleSubscribe}
                    disabled={isSubscribing}
                    icon={isSubscribed ? UserCheck : UserPlus}
                    className={
                      isSubscribed
                        ? 'bg-[#EDE9FE] text-[#7C3AED] border-purple-200 hover:bg-purple-100'
                        : ''
                    }
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                </div>
              )}
            </div>

            {/* Actions: Like, Share */}
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={isLiking}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border
                  ${
                    isLiked
                      ? 'bg-[#EDE9FE] text-[#7C3AED] border-purple-300 shadow-xs'
                      : 'bg-[#F8FAFC] text-slate-700 hover:bg-[#EDE9FE] hover:text-[#7C3AED] border-slate-200'
                  }
                `}
                aria-label="Like video"
              >
                <ThumbsUp
                  className={`w-4 h-4 ${isLiked ? 'fill-[#7C3AED] text-[#7C3AED]' : ''}`}
                />
                <span>{formatViews(likesCount)}</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#F8FAFC] text-slate-700 hover:bg-[#EDE9FE] hover:text-[#7C3AED] border border-slate-200 transition-colors cursor-pointer"
                aria-label="Share video"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </>
                )}
              </button>

              {/* Save to Playlist Button */}
              <button
                type="button"
                onClick={handleOpenPlaylistModal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#F8FAFC] text-slate-700 hover:bg-[#EDE9FE] hover:text-[#7C3AED] border border-slate-200 transition-colors cursor-pointer"
                aria-label="Save to playlist"
              >
                <ListPlus className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div className="p-4 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-700 mb-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {Number(video.views || 0).toLocaleString()} views
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatRelativeTime(video.createdAt)}
              </span>
            </div>

            <p
              className={`text-sm text-slate-800 leading-relaxed whitespace-pre-line ${
                !isDescriptionExpanded ? 'line-clamp-3' : ''
              }`}
            >
              {video.description || 'No description provided for this video.'}
            </p>

            {video.description && video.description.length > 150 && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isDescriptionExpanded ? (
                  <>
                    Show less <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Comment Section Component */}
          <CommentSection videoId={videoId} />
        </div>

        {/* Right Column: Recommended Videos (1 col on large screen) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-2">
            Up Next
          </h3>

          {isLoadingRecs ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-[#7C3AED] animate-spin" />
            </div>
          ) : recommendedVideos.length === 0 ? (
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
              No additional recommendations available.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedVideos.map((rec) => (
                <Link
                  key={rec._id}
                  to={`/watch/${rec._id}`}
                  className="flex gap-2.5 group p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                    <img
                      src={rec.thumbnail}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {rec.duration && (
                      <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[10px] font-semibold px-1 rounded">
                        {formatDuration(rec.duration)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#0F172A] line-clamp-2 leading-tight group-hover:text-[#7C3AED] transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      {rec.owner?.fullName || rec.owner?.username || 'Creator'}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatViews(rec.views)} views • {formatRelativeTime(rec.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        videoId={videoId}
        videoTitle={video?.title}
      />
    </div>
  );
}
