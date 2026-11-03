import axiosInstance from './axiosInstance';

/**
 * Likes API services matching confirmed backend routes under /api/v1/likers.
 */

// Toggle like on a video
export const toggleVideoLike = async (videoId) => {
  const response = await axiosInstance.post(`/likers/toggle/v/${videoId}`);
  return response.data;
};

// Toggle like on a comment
export const toggleCommentLike = async (commentId) => {
  const response = await axiosInstance.post(`/likers/toggle/c/${commentId}`);
  return response.data;
};

// Toggle like on a tweet
export const toggleTweetLike = async (tweetId) => {
  const response = await axiosInstance.post(`/likers/toggle/t/${tweetId}`);
  return response.data;
};

// Get all videos liked by the authenticated user
export const getLikedVideos = async () => {
  const response = await axiosInstance.get('/likers/videos');
  return response.data;
};
