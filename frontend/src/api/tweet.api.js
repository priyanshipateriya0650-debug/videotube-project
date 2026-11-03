import axiosInstance from './axiosInstance';
import { toggleTweetLike } from './like.api';

/**
 * Community Tweets API client matching confirmed backend routes under /api/v1/tweets.
 */

// Fetch all community tweets (feed)
export const getAllTweets = async ({ page = 1, limit = 20 } = {}) => {
  const response = await axiosInstance.get('/tweets', {
    params: { page, limit },
  });
  return response.data;
};

// Fetch tweets posted by a specific user (for channel profile or personal list)
export const getUserTweets = async (userId, { page = 1, limit = 20 } = {}) => {
  const response = await axiosInstance.get(`/tweets/user/${userId}`, {
    params: { page, limit },
  });
  return response.data;
};

// Create a new community tweet
export const createTweet = async ({ content }) => {
  const response = await axiosInstance.post('/tweets', {
    content,
  });
  return response.data;
};

// Update an existing tweet
export const updateTweet = async (tweetId, { content }) => {
  const response = await axiosInstance.patch(`/tweets/${tweetId}`, {
    content,
  });
  return response.data;
};

// Delete a tweet
export const deleteTweet = async (tweetId) => {
  const response = await axiosInstance.delete(`/tweets/${tweetId}`);
  return response.data;
};

// Re-export toggleTweetLike for convenient imports
export { toggleTweetLike };
