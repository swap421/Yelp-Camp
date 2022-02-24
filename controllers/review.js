const Review=require('../models/review')
const Campground=require('../models/campground')

module.exports.createReview=async(req,res)=>{
    const campground=await Campground.findById(req.params.id)
    const review=new Review(req.body.review)
    //Assigning Review to logged in user
    review.author=req.user._id;
    campground.reviews.push(review)
    console.log(req.params)
    await review.save();
    await campground.save();
    req.flash('success','Created New Review')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview=async(req,res)=>{
    const {id,reviewId}=req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}}) //pull removes all instances of element from array
    await Review.findByIdAndDelete(reviewId)
    req.flash('success','Successfully Deleted Review')
    res.redirect(`/campgrounds/${id}`)
}