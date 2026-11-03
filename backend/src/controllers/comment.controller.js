import mongoose from "mongoose"
import { isValidObjectId } from "mongoose";
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    // Check whether the video exists
    const videoExists = await Video.exists({ _id: videoObjectId });

    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    // Count all comments on this video
    const totalComments = await Comment.countDocuments({
        video: videoObjectId
    });

    // Fetch comments and their owners
    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoObjectId
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
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ],
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                _id: 1,
                content: 1,
                owner: 1,
                video: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalComments,
                currentPage: page,
                limit,
                comments
            },
            "Video comments fetched successfully"
        )
    );
});


const getMyComments = asyncHandler(async (req, res) => {
    const ownerId = req.user._id;

    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    // Fetch comments posted by the logged-in user
    const comments = await Comment.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(ownerId)
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
                from: "videos",
                localField: "video",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            thumbnail: 1,
                            owner: 1
                        }
                    }
                ],
                as: "video"
            }
        },
        {
            $unwind: {
                path: "$video",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                video: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    // Count all comments posted by this user
    const totalComments = await Comment.countDocuments({
        owner: ownerId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalComments,
                currentPage: page,
                limit,
                comments
            },
            "Your comments fetched successfully"
        )
    );
});


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    const ownerId = req.user._id;  

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
        const videoObjectId = new mongoose.Types.ObjectId(videoId);
        const videoExists = await Video.exists({ _id: videoObjectId });
        if (!videoExists) {
            throw new ApiError(404, "Video not found");
        }
    

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

        const comment = await Comment.create({
            content,
            video: videoObjectId,
            owner: ownerId
        });
    
        if(!comment) {
            throw new ApiError(500, "Failed to create comment");
        }
        return res.status(201).json(
            new ApiResponse(
                201,
                comment,
                "Comment created successfully"
            )
        );
});


const updateComment = asyncHandler(async (req, res) => {
    const { videoId, commentId } = req.params;
    const { content } = req.body;

    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Validate comment ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Validate comment content
    if (typeof content !== "string" || !content.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    // Check whether the video exists
    const videoExists = await Video.exists({ _id: videoId });

    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    // Check whether the comment belongs to this video
    const comment = await Comment.findOne({
        _id: commentId,
        video: videoId
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check comment ownership
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content: content.trim() } },
        { new: true, 
            runValidators: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    );
});


const deleteComment = asyncHandler(async (req, res) => {
    const { videoId, commentId } = req.params;
    const ownerId = req.user._id;

    // Validate IDs
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Check whether the video exists
    const videoExists = await Video.exists({ _id: videoId });

    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    // Find the comment belonging to this video
    const comment = await Comment.findOne({
        _id: commentId,
        video: videoId
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check whether the logged-in user owns the comment
    if (comment.owner.toString() !== ownerId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    // Delete the comment
    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        video: videoId,
        owner: ownerId
    });

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found or already deleted");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedComment,
            "Comment deleted successfully"
        )
    );
});


export {
    getVideoComments, 
    getMyComments,
    addComment, 
    updateComment,
     deleteComment
    }