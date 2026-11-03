import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet = asyncHandler(async (req, res) => {
    // Get tweet content
    const { content } = req.body;
    const ownerId = req.user._id;

    // Check content
    if (!content || typeof content !== "string" || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }


    // Create tweet
    const tweet = await Tweet.create({
        content: content.trim(),
        owner: ownerId
    });

    //tweet creation failed
    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully"
        )
    );
});


const getUserTweets = asyncHandler(async (req, res) => {
    // Get user ID from URL
    const { userId } = req.params;

    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    // Validate user ID
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check whether user exists
    const userExists = await User.exists({ _id: userObjectId });

    if (!userExists) {
        throw new ApiError(404, "User not found");
    }

    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: userObjectId
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: currentUserId
                    ? { $in: [currentUserId, "$likes.likedBy"] }
                    : false
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ]);

    // Count total tweets
    const totalTweets = await Tweet.countDocuments({
        owner: userObjectId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalTweets,
                currentPage: page,
                limit,
                tweets
            },
            "User tweets fetched successfully"
        )
    );
});

const getAllTweets = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const tweets = await Tweet.aggregate([
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: currentUserId
                    ? { $in: [currentUserId, "$likes.likedBy"] }
                    : false
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ]);

    const totalTweets = await Tweet.countDocuments({});

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalTweets,
                currentPage: page,
                limit,
                tweets
            },
            "All tweets fetched successfully"
        )
    );
});


const updateTweet = asyncHandler(async (req, res) => {
    // Get tweet ID and content
    const { tweetId } = req.params;
    const { content } = req.body;
    const ownerId = req.user._id;

    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Check content
    if (!content || typeof content !== "string" || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const tweetObjectId = new mongoose.Types.ObjectId(tweetId);

    // Check whether tweet exists
    const tweet = await Tweet.findById(tweetObjectId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check whether logged-in user owns this tweet
    if (tweet.owner.toString() !== ownerId.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    // Update tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetObjectId,
        { content: content.trim() },
        { new: true, runValidators: true }
    );

    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        )
    );
});


const deleteTweet = asyncHandler(async (req, res) => {
    // Get tweet ID
    const { tweetId } = req.params;
    const ownerId = req.user._id;

    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweetObjectId = new mongoose.Types.ObjectId(tweetId);

    // Check whether tweet exists
    const tweet = await Tweet.findById(tweetObjectId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check whether logged-in user owns this tweet
    if (tweet.owner.toString() !== ownerId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    // Delete tweet
    const deletedTweet = await Tweet.findByIdAndDelete(tweetObjectId);

    if (!deletedTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedTweet,
            "Tweet deleted successfully"
        )
    );
});


export {
    createTweet,
    getUserTweets,
    getAllTweets,
    updateTweet,
    deleteTweet
};
