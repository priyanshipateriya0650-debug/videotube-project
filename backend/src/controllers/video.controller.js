import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {deleteFromCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = -1,
        userId
    } = req.query

    // 1. Pagination
    const pageNumber = Math.max(1, Number(page) || 1)
    const limitNumber = Math.max(1, Number(limit) || 10)
    const skip = (pageNumber - 1) * limitNumber

    // 2. Match conditions
    const matchConditions = {
        isPublished: true
    }

    // 3. Search videos by title or description
    if (query?.trim()) {
        matchConditions.$or = [
            { title: { $regex: query.trim(), $options: "i" } },
            { description: { $regex: query.trim(), $options: "i" } }
        ]
    }

    // 4. Filter videos by user
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID")
        }

        matchConditions.owner = new mongoose.Types.ObjectId(userId)
    }

    // 5. Sorting
    const sortOptions = {
        [sortBy]: Number(sortType) === 1 ? 1 : -1
    }

    // 6. Aggregation pipeline
    const videos = await Video.aggregate([
        {
            $match: matchConditions
        },
        {
            $sort: sortOptions
        },
        /*
        $skip: Skipping records for pagination
        - Formula: (page number - 1) * limit
        - If page = 2 and limit = 10, skips (2-1) * 10 = 10 records
      */
        {
            $skip: skip
        },
        /*
        $limit: Limits the number of results per page
        - Ensures that the number of results does not exceed the "limit" value
      */
        {
            $limit: limitNumber
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1
                }
            }
        }
    ])

    // 7. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    )
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
   if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required")
}
    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if(!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    if(!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }
    const video_res=await uploadOnCloudinary(videoLocalPath, "videotube/video")
    const thumbnail_res=await uploadOnCloudinary(thumbnailLocalPath, "videotube/thumbnail")
      if(!thumbnail_res){
        throw new ApiError(400, "Thumbnail upload failed")
    }
    if(!video_res){
        throw new ApiError(400, "Video upload failed")
    }
  
  const video=await Video.create({
     title:title,
            description: description,
            thumbnail:thumbnail_res?.url,
            videoFile:video_res?.url,
            duration:video_res?.duration,
            isPublished:true,
            owner:req.user?._id
  })
  if(!video){
    throw new ApiError(400, "Video upload failed")
  }
    return res
        .status(200)
        .json(
            new ApiResponse(200,
                video,
                "video uploaded successfully"
            )
        )
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // 1. ID validate karo
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // aggregate me auto-cast nahi hota, isliye dono ids manually ObjectId banao
  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const userObjectId = new mongoose.Types.ObjectId(req.user._id);

  // 2. Pipeline
  const video = await Video.aggregate([
    // Sahi video dhundo
    { $match: { _id: videoObjectId } },

    // Is video ke likes
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },

    // Owner + uske subscribers
    // Pipeline ke andar main owner (u1) hoon. Subscriptions me jahan channel 
    // field meri id (u1) 
    // ho, un documents ke subscriber mere subscribers hain.
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: { $in: [userObjectId, "$subscribers.subscriber"] },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },

    // Computed fields
    {
      $addFields: {
        owner: { $first: "$owner" },
        likesCount: { $size: "$likes" },
        isLiked: { $in: [userObjectId, "$likes.likedBy"] },
      },
    },

    // Sirf kaam ke fields (likes array hata diya)
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);

  // 3. Aggregate array deta hai
  if (!video.length) {
    throw new ApiError(404, "Video not found");
  }

  const foundVideo = video[0];

  // 4. Unpublished video sirf owner dekh sakta hai
  if (
    !foundVideo.isPublished &&
    foundVideo.owner._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "This video is not published");
  }

  // 5. Views +1 aur watch history update
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { watchHistory: videoId },
  });
  await User.findByIdAndUpdate(req.user._id, {
    $push: { watchHistory: videoId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, foundVideo, "Video fetched successfully"));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // 1. Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    // 2. Check if at least one field is provided
    const thumbnailLocalPath = req.file?.path;

    if (
        title === undefined &&
        description === undefined &&
        !thumbnailLocalPath
    ) {
        throw new ApiError(400, "At least one field is required to update");
    }

    // 3. Validate only the fields that were provided
    const updateFields = {};

    if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
            throw new ApiError(400, "Title cannot be empty");
        }
        updateFields.title = title.trim();
    }

    if (description !== undefined) {
        if (typeof description !== "string" || !description.trim()) {
            throw new ApiError(400, "Description cannot be empty");
        }
        updateFields.description = description.trim();
    }

    // 4. Fetch video
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 5. Check ownership
    if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    // 6. Upload and update thumbnail only if a new one is provided
    if (thumbnailLocalPath) {
        const thumbnailOnCloudinary = await uploadOnCloudinary(
            thumbnailLocalPath,
            "myTube/thumbnail"
        );

        if (!thumbnailOnCloudinary?.url) {
            throw new ApiError(500, "Error while uploading thumbnail");
        }

        // Delete old thumbnail after the new one uploads successfully
        const thumbnailOldUrl = video.thumbnail;

        updateFields.thumbnail = thumbnailOnCloudinary.url;

        if (thumbnailOldUrl) {
            const deleteThumbnail = await deleteFromCloudinary(
                thumbnailOldUrl,
                "myTube/thumbnail"
            );

            if (!deleteThumbnail) {
                throw new ApiError(500, "Failed to delete old thumbnail");
            }
        }
    }

    // 7. Update only the provided fields
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        {
            new: true,
            runValidators: true
        }
    );

    // 8. Check if video was updated
    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }

    // 9. Return response
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video details updated successfully"
        )
    );
});



const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoId")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"videoId not found")
    }

    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(400,"user not allowed to delete")
    }

    const videoFile = await deleteFromCloudinary(video.videoFile,"myTube/video")
    const thumbnailFile = await deleteFromCloudinary(video.thumbnail,"myTube/thumbnail")

    if(!videoFile && !thumbnailFile){
        throw new ApiError(400,"thumbnail or videoFile is not deleted from cloudinary")
    }

     // 4. Delete the video document from the database
     await video.deleteOne();  // .remove dont work with findOne it only works with findById 

     return res.status(200)
     .json(new ApiResponse(
        200,
        {},
        "video deleted successfully"
     ))

});

const togglePublishStatus = asyncHandler(async (req, res) => {
   const { videoId } = req.params

    // 1.Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    //2. Fetch video from database
    const video = await Video.findById(videoId)

    // 3.Check whether video exists
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    //4. Check video ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this video")
    }

    //5. Toggle publish status
    video.isPublished = !video.isPublished

    await video.save()

    const message = video.isPublished
        ? "Video published successfully"
        : "Video unpublished successfully"

    return res.status(200).json(
        new ApiResponse(200, video, message)
    )
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}