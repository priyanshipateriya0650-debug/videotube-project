import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from '../../api/comment.api';
import { formatRelativeTime } from '../../utils/formatters';
import Button from '../common/Button';

export default function CommentSection({ videoId }) {
  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // New comment input state
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  // Edit comment state
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete comment state
  const [deletingId, setDeletingId] = useState(null);

  // Dropdown menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Fetch comments
  const loadComments = useCallback(async () => {
    if (!videoId) return;
    try {
      setIsLoading(true);
      setFetchError(null);
      const res = await getVideoComments(videoId, { page: 1, limit: 50 });
      if (res?.data) {
        setComments(res.data.comments || []);
        setTotalComments(res.data.totalComments || 0);
      }
    } catch (err) {
      setFetchError('Unable to load comments at this time.');
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Handle Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    try {
      setIsPosting(true);
      setPostError(null);
      const res = await addComment(videoId, content.trim());
      
      const newComment = res?.data;
      if (newComment) {
        // Augment with current user profile for instant clean display
        const enrichedComment = {
          ...newComment,
          owner: {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
          },
        };
        setComments((prev) => [enrichedComment, ...prev]);
        setTotalComments((prev) => prev + 1);
        setContent('');
      }
    } catch (err) {
      setPostError(err.response?.data?.message || 'Failed to post comment. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Start editing a comment
  const startEditing = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
    setActiveMenuId(null);
  };

  // Save edited comment
  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim() || isUpdating) return;

    try {
      setIsUpdating(true);
      const res = await updateComment(videoId, commentId, editContent.trim());
      if (res?.data) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, content: editContent.trim() } : c))
        );
        setEditingId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update comment.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (deletingId) return;
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      setDeletingId(commentId);
      await deleteComment(videoId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setTotalComments((prev) => Math.max(0, prev - 1));
      setActiveMenuId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#7C3AED]" />
        <h2 className="text-lg font-bold text-[#0F172A]">
          {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
        </h2>
      </div>

      {/* Add Comment Input Form */}
      {isAuthenticated && user ? (
        <form onSubmit={handleAddComment} className="flex gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName || user.username}
              className="w-10 h-10 rounded-full object-cover border border-purple-200 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}

          <div className="flex-1 space-y-2">
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] transition-all text-sm resize-none"
              disabled={isPosting}
            />

            {postError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {postError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              {content && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setContent('')}
                  disabled={isPosting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                disabled={!content.trim() || isPosting}
              >
                {isPosting ? 'Posting...' : 'Comment'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">Want to join the conversation?</p>
          <Link to="/login">
            <Button variant="outline" size="sm">
              Sign In to Comment
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
        </div>
      ) : fetchError ? (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {fetchError}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = user && comment.owner?._id === user._id;
            const isEditingThis = editingId === comment._id;
            const isMenuOpen = activeMenuId === comment._id;

            return (
              <div key={comment._id} className="flex gap-3 group relative">
                {/* Avatar */}
                <Link to={`/c/${comment.owner?.username}`}>
                  {comment.owner?.avatar ? (
                    <img
                      src={comment.owner.avatar}
                      alt={comment.owner.username}
                      className="w-9 h-9 rounded-full object-cover border border-purple-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {comment.owner?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <Link
                      to={`/c/${comment.owner?.username}`}
                      className="text-xs font-bold text-[#0F172A] hover:text-[#7C3AED] transition-colors"
                    >
                      @{comment.owner?.username || 'user'}
                    </Link>
                    <span className="text-[11px] text-slate-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>

                  {isEditingThis ? (
                    <div className="mt-1.5 space-y-2">
                      <textarea
                        rows={2}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-[#F8FAFC] text-[#0F172A] p-2.5 rounded-lg border border-purple-300 focus:outline-none focus:bg-white text-sm resize-none"
                        disabled={isUpdating}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          disabled={isUpdating}
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSaveEdit(comment._id)}
                          disabled={!editContent.trim() || isUpdating}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isUpdating ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#0F172A] mt-1 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  )}
                </div>

                {/* Actions for Comment Owner */}
                {isOwner && !isEditingThis && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId(isMenuOpen ? null : comment._id)
                      }
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      aria-label="Comment options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-md border border-slate-200 py-1 z-20 text-xs">
                        <button
                          type="button"
                          onClick={() => startEditing(comment)}
                          className="w-full px-3 py-2 flex items-center gap-2 text-slate-700 hover:bg-[#EDE9FE] hover:text-[#7C3AED] transition-colors text-left cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment._id)}
                          className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
