import axiosInstance from './axiosInstance';

/**
 * Comments API services matching confirmed backend routes under /api/v1/comments.
 */

// Fetch paginated comments for a video
export const getVideoComments = async (videoId, params = {}) => {
  const response = await axiosInstance.get(`/comments/${videoId}`, { params });
  return response.data;
};

// Add a comment to a video
export const addComment = async (videoId, content) => {
  const response = await axiosInstance.post(`/comments/${videoId}`, { content });
  return response.data;
};

// Update an existing comment
export const updateComment = async (videoId, commentId, content) => {
  const response = await axiosInstance.patch(`/comments/c/${videoId}/${commentId}`, {
    content,
  });
  return response.data;
};

// Delete a comment
export const deleteComment = async (videoId, commentId) => {
  const response = await axiosInstance.delete(`/comments/c/${videoId}/${commentId}`);
  return response.data;
};

// Get current user's comments across all videos
export const getMyComments = async (params = {}) => {
  const response = await axiosInstance.get('/comments/my-comments', { params });
  return response.data;
};
