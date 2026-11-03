import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { formatDuration, formatViews } from '../../utils/formatters';

/**
 * Single video item row / card in Creator Studio.
 * Provides live publication toggle, edit trigger, delete confirmation trigger,
 * and direct preview link to watch page.
 */
export default function VideoRow({
  video,
  onTogglePublish,
  onEdit,
  onDelete,
  isToggling,
}) {
  const isPublished = Boolean(video.isPublished);

  const formattedDate = video.createdAt
    ? new Date(video.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown date';

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-purple-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left: Thumbnail & Details */}
      <div className="flex items-start gap-4 min-w-0 flex-1">
        {/* Thumbnail with duration badge */}
        <div className="relative group w-32 sm:w-40 aspect-video rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          {video.duration ? (
            <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          ) : null}
        </div>

        {/* Video Metadata */}
        <div className="min-w-0 flex-1">
          <Link
            to={`/watch/${video._id}`}
            className="font-semibold text-sm sm:text-base text-[#0F172A] hover:text-[#7C3AED] transition-colors line-clamp-1"
          >
            {video.title}
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
            {video.description || 'No description provided.'}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {formatViews(video.views || 0)} views
            </span>
            <span>Uploaded {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Right: Status Pill & Actions */}
      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
        {/* Publish / Unpublish Toggle Pill */}
        <button
          type="button"
          onClick={() => onTogglePublish(video._id)}
          disabled={isToggling}
          aria-label={isPublished ? 'Unpublish video' : 'Publish video'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 ${
            isPublished
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
          title="Click to toggle publication status"
        >
          {isToggling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPublished ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-600" />
          )}
          <span>{isPublished ? 'Published' : 'Unpublished'}</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* View Watch Page */}
          <Link
            to={`/watch/${video._id}`}
            aria-label="View video on site"
            title="Watch video"
            className="p-2 text-slate-500 hover:text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          {/* Edit Video */}
          <button
            type="button"
            onClick={() => onEdit(video)}
            aria-label="Edit video details"
            title="Edit title, description, or thumbnail"
            className="p-2 text-slate-500 hover:text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Video */}
          <button
            type="button"
            onClick={() => onDelete(video)}
            aria-label="Delete video"
            title="Delete video permanently"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
