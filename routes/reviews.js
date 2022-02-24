const express=require('express')
//merging Params of app.js and reviews.js(router has its own req.params)
const router=express.Router({mergeParams:true}); 
const catchAsync=require('../utils/catchAsync')
const Review=require('../models/review')
const Campground=require('../models/campground')
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware')
const reviews=require('../controllers/review')

router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports=router