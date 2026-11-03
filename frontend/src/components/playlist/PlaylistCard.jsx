import React from 'react';
import { Link } from 'react-router-dom';
import { ListVideo, Play, Trash2, Calendar } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

/**
 * PlaylistCard component for displaying a playlist summary.
 * Conforms to VideoTube's purple light theme.
 */
export default function PlaylistCard({ playlist, isOwner = false, onDelete }) {
  if (!playlist) return null;

  const playlistId = playlist._id;
  const videos = Array.isArray(playlist.videos) ? playlist.videos : [];
  const videoCount = videos.length;
  const firstVideo = videos[0];
  const thumbnail = firstVideo?.thumbnail;

  return (
    <div className="group flex flex-col bg-[#F8FAFC] rounded-2xl overflow-hidden border border-slate-200/90 hover:border-purple-300 transition-all duration-200 hover:shadow-md">
      {/* Thumbnail Stack Preview */}
      <Link
        to={`/playlist/${playlistId}`}
        className="relative aspect-video w-full bg-slate-100 overflow-hidden block"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-slate-100 text-[#7C3AED]">
            <ListVideo className="w-12 h-12 opacity-80 mb-1" />
            <span className="text-xs font-semibold text-purple-700">Empty Playlist</span>
          </div>
        )}

        {/* Video Count Overlay Pill */}
        <div className="absolute bottom-2.5 right-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow">
          <ListVideo className="w-3.5 h-3.5" />
          <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
        </div>

        {/* Play all hover overlay */}
        <div className="absolute inset-0 bg-[#7C3AED]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/95 text-[#7C3AED] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link to={`/playlist/${playlistId}`} className="block flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
                {playlist.name}
              </h3>
            </Link>

            {isOwner && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(playlistId, playlist.name);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete playlist"
                aria-label="Delete playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {playlist.description || 'No description provided.'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {playlist.createdAt ? formatRelativeTime(playlist.createdAt) : 'Recently'}
          </span>
          <Link
            to={`/playlist/${playlistId}`}
            className="text-xs font-semibold text-[#7C3AED] hover:underline"
          >
            View full playlist &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
