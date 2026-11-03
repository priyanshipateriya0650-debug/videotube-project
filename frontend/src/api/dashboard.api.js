import axiosInstance from './axiosInstance';

/**
 * Dashboard API services matching backend routes under /api/v1/dashboard.
 */

// Fetch creator's channel analytics (totalVideos, totalSubscribers, totalVideoLikes, totalViews)
export const getChannelStats = async () => {
  const response = await axiosInstance.get('/dashboard/stats');
  return response.data?.data || response.data;
};

// Fetch all videos uploaded by the authenticated creator
export const getChannelVideos = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/videos');
    // Defensive check: handle ApiResponse(200, data, message) or legacy swapped arguments
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data?.message)) {
      return response.data.message;
    }
    return [];
  } catch (error) {
    // If backend returns 404 when no videos are found, return empty array gracefully
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};
