import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import {
  formatViews,
  formatRelativeTime,
  formatDuration,
} from '../../utils/formatters';

/**
 * VideoCard component displaying thumbnail, duration, channel avatar,
 * title, views, and timestamp with VideoTube's light theme.
 * Connects to /watch/:videoId.
 */
export default function VideoCard({ video }) {
  if (!video) return null;

  const videoId = video._id || video.id;
  const title = video.title || 'Untitled Video';
  const thumbnail = video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

  // Handle owner details from backend or mock
  const channelName = video.owner?.fullName || video.owner?.username || video.channelName || 'VideoTube Creator';
  const channelAvatar = video.owner?.avatar || video.channelAvatar;
  const channelUsername = video.owner?.username;

  // Handle formatted duration, views, timestamp
  const displayDuration = typeof video.duration === 'number'
    ? formatDuration(video.duration)
    : video.duration || '00:00';

  const displayViews = typeof video.views === 'number'
    ? `${formatViews(video.views)} views`
    : video.views ? `${video.views} views` : '0 views';

  const displayTime = video.createdAt
    ? formatRelativeTime(video.createdAt)
    : video.uploadedAt || 'Recently';

  return (
    <div className="group flex flex-col bg-[#F8FAFC] rounded-xl overflow-hidden border border-slate-200/80 hover:border-purple-300 transition-all duration-200 hover:shadow-md">
      {/* Thumbnail Container */}
      <Link
        to={`/watch/${videoId}`}
        className="relative aspect-video w-full bg-slate-200 overflow-hidden block"
      >
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-xs font-semibold px-2 py-0.5 rounded shadow">
          {displayDuration}
        </span>
      </Link>

      {/* Info Container */}
      <div className="p-3.5 flex gap-3">
        {/* Channel Avatar */}
        <div className="flex-shrink-0">
          {channelUsername ? (
            <Link to={`/c/${channelUsername}`}>
              {channelAvatar ? (
                <img
                  src={channelAvatar}
                  alt={channelName}
                  className="w-9 h-9 rounded-full object-cover border border-purple-200 hover:ring-2 hover:ring-[#7C3AED]/40 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-xs border border-purple-200">
                  {channelName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </Link>
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-xs border border-purple-200">
              {channelName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Video Metadata */}
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${videoId}`}>
            <h3 className="text-sm font-semibold text-[#0F172A] line-clamp-2 leading-snug group-hover:text-[#7C3AED] transition-colors">
              {title}
            </h3>
          </Link>

          {channelUsername ? (
            <Link
              to={`/c/${channelUsername}`}
              className="text-xs text-slate-600 mt-1 hover:text-[#7C3AED] transition-colors block truncate"
            >
              {channelName}
            </Link>
          ) : (
            <p className="text-xs text-slate-600 mt-1 truncate">{channelName}</p>
          )}

          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span>{displayViews}</span>
            <span>•</span>
            <span>{displayTime}</span>
          </div>
        </div>

        {/* Options menu button */}
        <button
          type="button"
          aria-label="Video options"
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/60 transition-opacity self-start"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
