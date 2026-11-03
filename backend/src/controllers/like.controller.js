import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id

    //1 Validate videoId
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }
    //you should check if the video exists before liking it
    const video = await Video.findById(videoId);

if (!video) {
    throw new ApiError(404, "Video not found");
}
    //2 Check if the user has already liked the video
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (existingLike) {
        // User has already liked the video, so unlike it
        await Like.deleteOne({ _id: existingLike._id })
        return res.status(200).
        json(
            new ApiResponse(200, 
            {},
             "Video unliked successfully")
            )}
     else {
        // User has not liked the video, so like it
        await Like.create({
            video: videoId,
            likedBy: userId
        })
        return res.status(200).
        json(
            new ApiResponse(200,
                 {},
                  "Video liked successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {``
    const {commentId} = req.params
    const userId = req.user._id

    //1 Validate commentId
    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const comment = await Comment.findById(commentId);

if (!comment) {
    throw new ApiError(404, "Comment not found");
}
    //2 Check if the user has already liked the comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (existingLike) {
        // User has already liked the comment, so unlike it
        await Like.deleteOne({ _id: existingLike._id })
        return res.status(200).
        json(
            new ApiResponse(200, 
            {},
             "Comment unliked successfully")
            )}
     else {
        // User has not liked the comment, so like it
        await Like.create({
            comment: commentId,
            likedBy: userId
        })
        return res.status(200).
        json(
            new ApiResponse(200,
                 {},
                  "Comment liked successfully"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id

    //1 Validate tweetId
    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    //2 Check if the user has already liked the tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if (existingLike) {
        // User has already liked the tweet, so unlike it
        await Like.deleteOne({ _id: existingLike._id })
        return res.status(200).
        json(
            new ApiResponse(200, 
            {},
             "Tweet unliked successfully")
            )}
     else {
        // User has not liked the tweet, so like it
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
        return res.status(200).
        json(
            new ApiResponse(200,
                 {},
                  "Tweet liked successfully"))
    }
})

 
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $ne: null }
    })
        .populate("video", "_id title url thumbnail")
        .exec();

    // Remove likes whose video document no longer exists
    const validLikedVideos = likedVideos.filter(
        (like) => like.video !== null
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            { likedVideos: validLikedVideos },
            "Liked videos fetched successfully"
        )
    );
})
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}