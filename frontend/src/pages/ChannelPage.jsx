import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  UserPlus,
  Settings as SettingsIcon,
  VideoOff,
  Loader2,
  AlertCircle,
  Film,
  Mail,
  Users,
  Eye,
  Calendar,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { getChannelProfile } from '../api/auth.api';
import { getAllVideos } from '../api/video.api';
import { getUserTweets } from '../api/tweet.api';
import { toggleSubscription } from '../api/subscription.api';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/video/VideoCard';
import VideoCardSkeleton from '../components/video/VideoCardSkeleton';
import TweetCard from '../components/tweets/TweetCard';
import CreateTweetBox from '../components/tweets/CreateTweetBox';
import Button from '../components/common/Button';
import { formatViews } from '../utils/formatters';

export default function ChannelPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('videos');

  const [isLoadingChannel, setIsLoadingChannel] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [error, setError] = useState(null);

  // Tweets state
  const [tweets, setTweets] = useState([]);
  const [isLoadingTweets, setIsLoadingTweets] = useState(false);
  const [hasFetchedTweets, setHasFetchedTweets] = useState(false);

  // Subscription state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch channel profile by username
  const fetchChannelData = useCallback(async () => {
    if (!username) return;

    try {
      setIsLoadingChannel(true);
      setError(null);

      const res = await getChannelProfile(username);
      const data = res?.data;

      if (data) {
        setChannel(data);
        setIsSubscribed(Boolean(data.isSubscribed));
        setSubscribersCount(Number(data.subscribersCount) || 0);

        // Fetch channel's videos using channel._id if available
        if (data._id) {
          fetchChannelVideos(data._id);
        } else {
          setIsLoadingVideos(false);
        }
      } else {
        setError('Channel not found.');
        setIsLoadingVideos(false);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Channel "@${username}" does not exist.`);
      } else if (err.response?.status === 401) {
        setError('Please sign in to view this channel profile.');
      } else {
        setError(err.response?.data?.message || 'Failed to load channel profile.');
      }
      setIsLoadingVideos(false);
    } finally {
      setIsLoadingChannel(false);
    }
  }, [username]);

  // Fetch channel videos using user ID
  const fetchChannelVideos = async (channelId) => {
    try {
      setIsLoadingVideos(true);
      const res = await getAllVideos({ userId: channelId, limit: 30 });
      setVideos(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load channel videos:', err);
      setVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Fetch channel community tweets using user ID
  const fetchChannelTweets = useCallback(async (channelId) => {
    if (!channelId) return;
    try {
      setIsLoadingTweets(true);
      const res = await getUserTweets(channelId, { limit: 30 });
      const items = res?.data?.tweets || res?.data || [];
      setTweets(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load channel tweets:', err);
      setTweets([]);
    } finally {
      setIsLoadingTweets(false);
      setHasFetchedTweets(true);
    }
  }, []);

  const handleTweetCreated = (newTweet) => {
    if (newTweet) setTweets((prev) => [newTweet, ...prev]);
  };

  const handleTweetUpdated = (updated) => {
    setTweets((prev) =>
      prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t))
    );
  };

  const handleTweetDeleted = (id) => {
    setTweets((prev) => prev.filter((t) => t._id !== id));
  };

  useEffect(() => {
    fetchChannelData();
    window.scrollTo(0, 0);
  }, [fetchChannelData]);

  // Toggle channel subscription
  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/c/${username}` } } });
      return;
    }
    if (!channel?._id || isSubscribing) return;

    try {
      setIsSubscribing(true);
      await toggleSubscription(channel._id);
      setIsSubscribed((prev) => !prev);
      setSubscribersCount((prev) => (isSubscribed ? Math.max(0, prev - 1) : prev + 1));
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoadingChannel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading channel profile...</p>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#0F172A]">Channel Unavailable</h1>
        <p className="text-slate-600 text-sm mt-2">{error || 'This channel could not be found.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          {error?.includes('sign in') ? (
            <Link to="/login">
              <Button variant="primary">Sign In</Button>
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

  const isOwnChannel =
    user &&
    (user._id === channel._id ||
      user.username?.toLowerCase() === channel.username?.toLowerCase());

  const displayCover = isOwnChannel ? (user.coverImage || channel.coverImage) : channel.coverImage;
  const displayAvatar = isOwnChannel ? (user.avatar || channel.avatar) : channel.avatar;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      {/* Channel Banner / Cover Image */}
      <div className="w-full h-36 sm:h-52 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-100 via-purple-50 to-[#F8FAFC] border border-slate-200 relative">
        {displayCover ? (
          <img
            src={displayCover}
            alt={`${channel.fullName || channel.username} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Sparkles className="w-12 h-12 text-purple-200" />
          </div>
        )}
      </div>

      {/* Channel Header Information */}
      <div className="px-2 sm:px-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="flex items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md bg-white -mt-10 sm:-mt-14 overflow-hidden flex-shrink-0 z-10">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={channel.fullName || channel.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-2xl">
                {channel.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* Text Info */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] leading-tight">
              {channel.fullName || channel.username}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">@{channel.username}</p>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>
                {subscribersCount} {subscribersCount === 1 ? 'subscriber' : 'subscribers'}
              </span>
              <span>•</span>
              <span>
                {videos.length} {videos.length === 1 ? 'video' : 'videos'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Subscribe or Edit Profile */}
        <div className="self-start sm:self-auto">
          {isOwnChannel ? (
            <Link to="/settings">
              <Button variant="secondary" icon={SettingsIcon}>
                Edit Profile
              </Button>
            </Link>
          ) : (
            <Button
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
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className={`
            pb-3 px-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2
            ${
              activeTab === 'videos'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-600 hover:text-[#7C3AED]'
            }
          `}
        >
          <Film className="w-4 h-4" />
          <span>Videos ({videos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('tweets');
            if (!hasFetchedTweets && channel?._id) {
              fetchChannelTweets(channel._id);
            }
          }}
          className={`
            pb-3 px-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2
            ${
              activeTab === 'tweets'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-600 hover:text-[#7C3AED]'
            }
          `}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tweets {hasFetchedTweets && tweets.length > 0 ? `(${tweets.length})` : ''}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`
            pb-3 px-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2
            ${
              activeTab === 'about'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-600 hover:text-[#7C3AED]'
            }
          `}
        >
          <Users className="w-4 h-4" />
          <span>About</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' ? (
        <div>
          {isLoadingVideos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <VideoCardSkeleton key={idx} />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="max-w-md mx-auto py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-slate-200/80 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-300">
                <VideoOff className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A]">No Videos Uploaded</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isOwnChannel
                  ? 'You haven’t uploaded any videos to your channel yet.'
                  : 'This channel hasn’t uploaded any videos yet.'}
              </p>
              {isOwnChannel && (
                <div className="mt-6">
                  <Link to="/studio">
                    <Button variant="primary">Upload a Video</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map((vid) => (
                <VideoCard key={vid._id} video={vid} />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'tweets' ? (
        <div className="space-y-5 max-w-3xl">
          {isOwnChannel && (
            <CreateTweetBox onTweetCreated={handleTweetCreated} />
          )}

          {isLoadingTweets ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200/80" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-slate-200/80 rounded w-1/4" />
                      <div className="h-2.5 bg-slate-200/60 rounded w-1/6" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-1 pl-13">
                    <div className="h-3 bg-slate-200/70 rounded w-5/6" />
                    <div className="h-3 bg-slate-200/60 rounded w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : tweets.length === 0 ? (
            <div className="max-w-md mx-auto py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-[#0F172A]">No Tweets Yet</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isOwnChannel
                  ? "You haven't posted any community tweets yet. Share your thoughts using the form above!"
                  : `@${channel.username} hasn't posted any community tweets yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {tweets.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  onTweetUpdated={handleTweetUpdated}
                  onTweetDeleted={handleTweetDeleted}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* About Tab */
        <div className="max-w-2xl bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0F172A] border-b border-slate-200 pb-3">
            Channel Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Username
              </p>
              <p className="font-semibold text-[#0F172A]">@{channel.username}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Subscribers
              </p>
              <p className="font-semibold text-[#0F172A]">
                {subscribersCount} {subscribersCount === 1 ? 'subscriber' : 'subscribers'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Channels Subscribed To
              </p>
              <p className="font-semibold text-[#0F172A]">
                {channel.channelsSubscribedToCount || 0} channels
              </p>
            </div>

            {channel.email && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Contact
                </p>
                <p className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {channel.email}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
