const {campgroundSchema,reviewSchema}=require('./schemas.js')
const ExpressError=require('./utils/ExpressError')
const Campground=require('./models/campground')
const Review=require('./models/review')

//isAuthenticated is a method added to req object by passport
module.exports.isLoggedIn=(req,res,next)=>{
    //req.user is added by passport to req object after users login
    if (!req.isAuthenticated()){
        //req.originalUrl is a key inside req object, it stores the requested url
        req.session.returnTo=req.originalUrl
        req.flash('error','You must be Signed In first')
        return res.redirect('/login') 
    }
    next();
}
//Server side validation using Joi
module.exports.validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map(er=>er.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}
//It is Authorizing that currentUser is author of current campground or not
module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You are not Author of this Campground')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}
module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const review=await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error','You are not Author of this Review')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}
//Server side validation using Joi
module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(er=>er.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}