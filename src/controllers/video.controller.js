import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    
  
   const { title, description} = req.body
   
   //Optional Description,Mandatory title
   if(!title){
       throw new ApiError(400,"Title is required")
   }

   //The Logged In User
    const user=req.user
    if(!user){
        throw new ApiError(400,"User not Verified")
    }
    const userId=user._id

    //TWO MIDDLEWARES - req.file is overwritten, so use req.videoFile and req.imageFile
    // const videotoUpload=req.file?.videoFile?.[0]?.path
    const videotoUpload=req.videoFile?.videoFile?.[0]?.path
    const thumbnailtoUpload=req.imageFile?.thumbnail?.[0]?.path

    if(!videotoUpload){
        throw new ApiError(400,"Video File is Missing")
    }


    // MAKE THUMBNAIL MANDATORY
    // if(!thumbnailtoUpload){
    //     throw new ApiError(400,"Thumbnail File is Missing")
    // }

    const video= await uploadOnCloudinary(videotoUpload)   
    const thumbnail= await uploadOnCloudinary(thumbnailtoUpload) //Optional
    
    //Check if Upload is Successfull 
    if(!video){
       throw new ApiError(400,"Failed to Upload the Video") 
    }
    // REQUIRED:THUMBANAIL
    // if(!thumbnail){
    //    throw new ApiError(400,"Failed to Upload the Thumbnail")
    // }
    
    console.log("Video Cloudiary Response: ",video)
    //Get Duration From Cloudinary response
    const duration= video.duration;
    console.log(duration);
    
    //Update Database
    const VideoUpload= await Video.create({
        videoFile:video.url,
        thumbnail:thumbnail?.url || "" ,
        title:title,
        description:description,
        owner:userId,
        duration:duration,
        // views,
        // ispublished,

    })

    //check if the video is uploaded on DB
    const check=await Video.findById(VideoUpload._id)
    if(!check){
        throw new ApiError(500, "Something went wrong while uploading to Database")
    }

    return res.status(200).json(new ApiResponse(200,VideoUpload,"Video Uploaded Successfully"))
                                                                            
    

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
