import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    // some is the fncion which will check if any of the field is empty or not
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    console.log("req.files: ", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar upload is failed")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )


const loginUser = asyncHandler( async (req, res) => {
    // take username and email and password from frontend
   console.log("req.body: ", req.body);
    const {username, email, password} = req.body


    if(!username && !email){
        throw new ApiError(400, "Username or email is required")
    }
    // check if user exists with username or email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    // check if password is correct

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid password")
    }
    // generate access and refresh token
const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    // return access and refresh token to frontend
    return res
.status(200)
.cookie("refreshToken", refreshToken, options)
.cookie("accessToken", accessToken, options)
.json(
    new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        ))
    
})
//Logout the user

const logOutUser= asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        { 
        $unset: { refreshToken: 1 }
    },
     { new: true })
      const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized: Refresh token is missing");
    }
try{
 const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
         if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        
            const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
             new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )

    }
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


//Change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const{oldPassword, newPassword} = req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Old password is incorrect")
    }
    user.password=newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


//Check Current User
const getCurrentUser=asyncHandler(async(req,res) => {
      return res
      .status(200)
      .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})



// update details
const updateAccountDetails=asyncHandler(async(req,res)=>{
    console.log("req.body: ", req.body);
   const {fullName, email,password} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName:fullName,
            email:email
        }
    },{new: true}
).select("-password -refreshToken")
res.status(200)
.json(new ApiResponse(200, user, "Details Updated Successfully") )
}) 


const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath) {
        throw new ApiError(400, "Cover image file is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
        throw new ApiError(400, "Error while uploading cover image")
    }
    const userr=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar: avatar.url
        }
    },{new: true}).select("-password")

    res.status(200)
    .json(new ApiResponse(200, userr, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage){
        throw new ApiError(400, "Error while uploading cover image")
    }
    const userr=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage: coverImage.url
        }
    },{new: true}).select("-password")
    //select(-password)ye error denga 

    res.status(200)
    .json(new ApiResponse(200, userr, "Cover image updated successfully"))
})


const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",//match through the id
                foreignField: "channel",//local field jo h vo kaha par honga
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        //$ subscribers is a field check kro ki vaha subscriber h ya nhi 
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})
//aggregate hamesa directly jata h to for getting the 
//id we cant write only 
// req.user._id 
// so we have to follow this code structure
const getWatchHistory = asyncHandler(async(req, res) => {
    // 1. Fetch user document to get the raw watchHistory array (ordered chronologically by watch event)
    const userDoc = await User.findById(req.user._id).select("watchHistory");
    if (!userDoc || !userDoc.watchHistory?.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "Watch history fetched successfully")
        );
    }

    // 2. Fetch the videos populated with owner info
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
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
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    const fetchedVideos = user[0]?.watchHistory || [];

    // Map videos by string ID for fast lookup
    const videoMap = new Map();
    fetchedVideos.forEach((v) => {
        if (v?._id) videoMap.set(v._id.toString(), v);
    });

    // Reconstruct the history matching userDoc.watchHistory in REVERSE order (newest watch event first)
    const sortedHistory = [];
    for (let i = userDoc.watchHistory.length - 1; i >= 0; i--) {
        const vidId = userDoc.watchHistory[i].toString();
        const video = videoMap.get(vidId);
        if (video) {
            sortedHistory.push(video);
            videoMap.delete(vidId); // ensure unique entry per video at its most recent watch position
        }
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            sortedHistory,
            "Watch history fetched successfully"
        )
    )
})

export { registerUser }
export { loginUser }
export { logOutUser }
export { refreshAccessToken }
export { changeCurrentPassword }
export { getCurrentUser}
export { updateAccountDetails}
export { updateUserAvatar}
export { updateUserCoverImage}
export { getUserChannelProfile}
export { getWatchHistory}
