import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }


    //Existence of subscriberId in User collection
    const channelObjectId = new mongoose.Types.ObjectId(channelId)
    const channel = await User.findById(channelObjectId)
    if(!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const userId = req.user._id

    //Channel Subscription Logic
    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })
    if(existingSubscription) {
        // User is already subscribed to the channel
        await Subscription.deleteOne({ _id: existingSubscription._id })
        return res.status(200).json(new ApiResponse(200, null, "Subscription removed"))
    } else {
        // User is not subscribed to the channel
        const newSubscription = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })

        //Subscription creation failed
        if(!newSubscription) {
            throw new ApiError(500, "Failed to create subscription")
        }
        return res.status(200).json(new ApiResponse(200, newSubscription, "Subscription added"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    //Existence of subscriberId in User collection
    const channelObjectId = new mongoose.Types.ObjectId(channelId)
    const channel = await User.findById(channelObjectId)
    if(!channel) {
        throw new ApiError(404, "Channel not found")
    }
// Fetch subscribers of the channel
    const subscribers = await Subscription.find( {
        channel: channelId
    })
    .populate("subscriber", "username email avatar")

    if(!subscribers || subscribers.length === 0) {
        return res.status(200)
        .json(new ApiResponse(200, [], 
            "No subscribers found"))
    }
    return res.status(200)
    .json(new ApiResponse(200, subscribers,
         "Subscriber list retrieved"))
})


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    

 

    // Fetch channels to which the user has subscribed
    const subscriptions = await Subscription.find({
        subscriber: subscriberId
    })
    .populate("channel", "subscriberId username fullName  avatar coverImage")   

    if (!subscriptions || subscriptions.length === 0) {
        return res.status(200)
        .json(new ApiResponse(200, [], 
            "No subscribed channels found"))
    }
    return res.status(200)
    .json(new ApiResponse(200, subscriptions,
         "Subscribed channels retrieved"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}