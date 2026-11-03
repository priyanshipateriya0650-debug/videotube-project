import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
        console.log("req.body", req.body)
    const {name, description} = req.body
    //1. Validate request body
        if(!name?.trim() )
            throw new ApiError(400,"Name of playlist is required")
        if(!description?.trim())
            throw new ApiError(400,"Description is required")

        //2. Create playlist
      const playlist= await Playlist.create({
        name:name.trim(),
        description:description.trim(),
        owner:req.user._id,
        videos:[]
      })

      //3. Check if playlist is created
      if(!playlist)
            throw new ApiError(500,"Failed to create playlist")
      
      //4. Return response
      return res.status(201)
      .json(new ApiResponse(201, playlist, "Playlist created successfully"))
})



const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

// 1. Validate userId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
// 2. Fetch playlists for the user and populate video details
    const playlists = await Playlist
        .find({ owner: userId })
        .populate({
            path: "videos",
            select: "title thumbnail description owner",
            populate: {
                path: "owner",
                select: "username avatar"
            }
        })
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            playlists,
            playlists.length
                ? "Playlists fetched successfully"
                : "No playlists found for this user"
        )
    );
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // 1. Validate playlistId
    if ( !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");

    }
    // 2. Fetch playlist and populate video details
   const findPlaylist = await Playlist.findById(playlistId)
   .populate({
        path: "videos",
        select: "title thumbnail description owner",
        populate: {
            path: "owner",
            select: " username avatar"
        }
    }) 
    .lean();


    // 3. Check if playlist exists
    if (!findPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    // 4. Return response
    return res.status(200).json(
        new ApiResponse(
            200,
            findPlaylist,
            "Playlist fetched successfully"
        )
    );
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    // 1. Validate playlistId and videoId
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }

    // 2. Fetch playlist
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    // 3. Check if playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    //4.Check if  current user is the owner of the playlist
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to add videos to this playlist");
    }
    // 5. Check if video is already in the playlist
    if (playlist.videos.some(
    id => id.toString() === videoId)) {
    throw new ApiError(400, "Video is already in the playlist");
}
   // 6. Add video to playlist
   playlist.videos.push(videoId);
  
 
   const addVideo =  await playlist.save();
    
    if(!addVideo){
        throw new ApiError(400,"Video not added to playlist please try again")
    }
    // 7. Return response
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video added to playlist successfully"
        )
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    // 1. Validate playlistId and videoId
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }
    
    //2. Fetch playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    //3. Check if current user is the owner of the playlist
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to remove videos from this playlist");
    }

    // 4. Check if video exists in the playlist
    const videoExists = playlist.videos.some(
    id => id.toString() === videoId
)

if (!videoExists) {
    throw new ApiError(404, "Video not found in this playlist");
}
    //5 Remove video from playlist

     /*

    - `findByIdAndUpdate(playlistId, update, options)`:
      - Finds a playlist by its ID.
      - Updates it based on the provided modifications.
    - `$pull`:
      - Removes a specific value from an array.
      - Here, it removes `videoId` from the `videos` array.
    - `new: true`:
      - Ensures we get the updated playlist as a response.

  */
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      new: true,
    }
  );

  // If no playlist is found, return a 404 error.
  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }


   
//6. Return response
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    );
});


const deletePlaylist = asyncHandler(async (req, res) => {

  const { playlistId } = req.params;

  //1. Validate 
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist= await Playlist.findById(playlistId)
 
  if(!playlist){
    throw new ApiError(404,"Playlist not found")
  }

  //2.Check ownrship
  if(req.user._id.toString() != playlist.owner.toString()){
      throw new ApiError(403,"Only Owner is allowed to edit their playlist")
  }


const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);   

if (!deletedPlaylist) {
    throw new ApiError(500, "Failed to delete playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200,
         {}, 
         "Playlist deleted successfully")
    );
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    //1. Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    //2.validate name and description
     if (
        name === undefined &&
        description === undefined     ) {
        throw new ApiError(400, "At least one field is required")
    }

    // 3. Validate only the fields that were provided
   const updateFields = {};

if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
        throw new ApiError(400, "Name cannot be empty");
    }
    updateFields.name = name.trim();
}

if (description !== undefined) {
    if (typeof description !== "string" || !description.trim()) {
        throw new ApiError(400, "Description cannot be empty");
    }
    updateFields.description = description.trim();
}

    //3. Fetch playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    //4. Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }

    //5. Update playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: updateFields },
        { new: true ,
        runValidators: true

        }
    );

    return res.status(200).json(
        new ApiResponse(200,
             updatedPlaylist,
              "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}