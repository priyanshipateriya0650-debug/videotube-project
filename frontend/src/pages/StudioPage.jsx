import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Video as VideoIcon,
  Eye,
  Users,
  ThumbsUp,
  Upload,
  RefreshCw,
  Search,
  AlertCircle,
  Film,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import StatsCard from '../components/studio/StatsCard';
import VideoRow from '../components/studio/VideoRow';
import UploadVideoModal from '../components/studio/UploadVideoModal';
import EditVideoModal from '../components/studio/EditVideoModal';
import DeleteConfirmModal from '../components/studio/DeleteConfirmModal';
import { getChannelStats, getChannelVideos } from '../api/dashboard.api';
import { deleteVideo, togglePublishStatus } from '../api/video.api';
import { formatViews } from '../utils/formatters';

/**
 * Creator Studio Page:
 * Comprehensive dashboard for creators to monitor channel analytics (videos, views, subscribers, likes)
 * and manage their uploaded videos (upload, edit metadata, publish/unpublish, delete).
 */
export default function StudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldAutoOpenUpload = searchParams.get('upload') === 'true';

  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalSubscribers: 0,
    totalVideoLikes: 0,
  });
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'unpublished'

  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(shouldAutoOpenUpload);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Fetch Stats and Videos
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const [statsData, videosData] = await Promise.all([
        getChannelStats().catch((err) => {
          console.error('Failed to fetch stats:', err);
          return {
            totalVideos: 0,
            totalViews: 0,
            totalSubscribers: 0,
            totalVideoLikes: 0,
          };
        }),
        getChannelVideos().catch((err) => {
          console.error('Failed to fetch videos:', err);
          return [];
        }),
      ]);

      if (statsData) {
        setStats({
          totalVideos: statsData.totalVideos ?? (videosData?.length || 0),
          totalViews: statsData.totalViews ?? 0,
          totalSubscribers: statsData.totalSubscribers ?? 0,
          totalVideoLikes: statsData.totalVideoLikes ?? 0,
        });
      }

      setVideos(Array.isArray(videosData) ? videosData : []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load Creator Studio data. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Keep modal open state in sync if query param changes
  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      setIsUploadOpen(true);
    }
  }, [searchParams]);

  const handleCloseUploadModal = () => {
    setIsUploadOpen(false);
    if (searchParams.get('upload')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('upload');
      setSearchParams(nextParams, { replace: true });
    }
  };

  // Upload video success callback
  const handleUploadSuccess = (newVideo) => {
    if (newVideo) {
      setVideos((prev) => [newVideo, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalVideos: prev.totalVideos + 1,
      }));
    } else {
      loadDashboardData();
    }
  };

  // Edit video success callback
  const handleVideoUpdated = (updatedVideo) => {
    setVideos((prev) =>
      prev.map((v) => (v._id === updatedVideo._id ? { ...v, ...updatedVideo } : v))
    );
  };

  // Toggle publish / unpublish
  const handleTogglePublish = async (videoId) => {
    try {
      setTogglingId(videoId);
      const res = await togglePublishStatus(videoId);
      const updated = res?.data;

      setVideos((prev) =>
        prev.map((v) => {
          if (v._id === videoId) {
            return {
              ...v,
              isPublished: updated?.isPublished !== undefined ? updated.isPublished : !v.isPublished,
            };
          }
          return v;
        })
      );
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      alert(
        err.response?.data?.message ||
          'Failed to change video status. Please try again.'
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Delete video confirmation
  const handleDeleteConfirm = async (videoId) => {
    try {
      setIsDeleting(true);
      await deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setStats((prev) => ({
        ...prev,
        totalVideos: Math.max(0, prev.totalVideos - 1),
      }));
      setDeletingVideo(null);
    } catch (err) {
      console.error('Failed to delete video:', err);
      alert(
        err.response?.data?.message ||
          'Failed to delete video. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered and searched video list
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      // Status filter
      if (statusFilter === 'published' && !video.isPublished) return false;
      if (statusFilter === 'unpublished' && video.isPublished) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = video.title?.toLowerCase().includes(query);
        const matchesDesc = video.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [videos, statusFilter, searchQuery]);

  const publishedCount = useMemo(() => videos.filter((v) => v.isPublished).length, [videos]);
  const unpublishedCount = useMemo(() => videos.filter((v) => !v.isPublished).length, [videos]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Creator Studio
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-[#7C3AED]">
              <Sparkles className="w-3 h-3" /> Dashboard
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Monitor channel performance, upload new videos, and manage your content library.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadDashboardData}
            disabled={isLoading}
            className={isLoading ? 'animate-spin' : ''}
          >
            Refresh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload Video
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-sm text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            className="border-red-300 text-red-700 hover:bg-red-100 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Uploads"
          value={isLoading ? '—' : stats.totalVideos}
          icon={VideoIcon}
          subtitle="Videos in your catalog"
        />
        <StatsCard
          title="Total Views"
          value={isLoading ? '—' : formatViews(stats.totalViews)}
          icon={Eye}
          subtitle="Lifetime views on videos"
        />
        <StatsCard
          title="Subscribers"
          value={isLoading ? '—' : stats.totalSubscribers}
          icon={Users}
          subtitle="Channel audience"
        />
        <StatsCard
          title="Total Likes"
          value={isLoading ? '—' : formatViews(stats.totalVideoLikes)}
          icon={ThumbsUp}
          subtitle="Likes across all videos"
        />
      </div>

      {/* Video Management Section */}
      <div className="space-y-4">
        {/* Section Header with Search & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              My Videos
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {videos.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title..."
                className="w-full sm:w-60 bg-white text-[#0F172A] placeholder-slate-400 pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#7C3AED] text-xs"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-[#7C3AED] font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                All ({videos.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'published'
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Published ({publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unpublished')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'unpublished'
                    ? 'bg-white text-amber-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Unpublished ({unpublishedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Video List / Empty State / Loading State */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 animate-pulse"
              >
                <div className="w-32 sm:w-40 aspect-video rounded-xl bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          /* Empty State for Brand New Creators */
          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto shadow-xs">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#0F172A]">
                No videos uploaded yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Ready to share your creativity? Upload your first video and thumbnail to start engaging with viewers across VideoTube.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={Upload}
              onClick={() => setIsUploadOpen(true)}
            >
              Upload Your First Video
            </Button>
          </div>
        ) : filteredVideos.length === 0 ? (
          /* Empty State for Filter or Search */
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm font-medium text-slate-600">
              No videos found matching your filters.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          /* Render Video Rows */
          <div className="space-y-3">
            {filteredVideos.map((video) => (
              <VideoRow
                key={video._id}
                video={video}
                onTogglePublish={handleTogglePublish}
                onEdit={setEditingVideo}
                onDelete={setDeletingVideo}
                isToggling={togglingId === video._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Video Modal */}
      <UploadVideoModal
        isOpen={isUploadOpen}
        onClose={handleCloseUploadModal}
        onSuccess={handleUploadSuccess}
      />

      {/* Edit Video Modal */}
      <EditVideoModal
        isOpen={Boolean(editingVideo)}
        onClose={() => setEditingVideo(null)}
        video={editingVideo}
        onVideoUpdated={handleVideoUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingVideo)}
        onClose={() => setDeletingVideo(null)}
        video={deletingVideo}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
