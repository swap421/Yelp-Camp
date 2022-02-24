const Campground=require('../models/campground')
const {cloudinary}=require('../cloudinary')
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken=process.env.MAPBOX_TOKEN;
//making new instance of mbxGeocoding
const geocoder=mbxGeocoding({accessToken:mapBoxToken})
module.exports.index=async(req,res)=>{
    const campgrounds=await Campground.find({})
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new')
}

module.exports.createCampground=async(req,res,next)=>{
    //Giving query and extracting coordinates
    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send();
    const campground=new Campground(req.body.campground)
    campground.geometry=geoData.body.features[0].geometry
    campground.image=req.files.map(f=>({url:f.path,filename:f.filename}))
    //Assigning req.user._id to author field of new campground
    campground.author=req.user._id
    await campground.save();
    req.flash('success','Successfully made a New Campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground=async(req,res)=>{
    const {id}=req.params
    //populating campground with reviews and populating each reviews with their author
    const campground=await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author')
    if(!campground){
        req.flash('error','Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground})
}

module.exports.renderEditForm=async(req,res)=>{
    const {id}=req.params
    const campground=await Campground.findById(id)
    if(!campground){
        req.flash('error','Cannot find that Campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit',{campground})
}

module.exports.updateCampground=async(req,res)=>{
    const {id}=req.params
    const campground=await Campground.findById(id)
    await Campground.findByIdAndUpdate(id,{...req.body.campground})
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}))
    campground.image.push(...imgs)
    console.log(campground)
    if(req.body.deleteImages){
        //Deleting checked images from cloudinary
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        //Deleting checked images from database
        //below query means pulling out of images array where filename is in req.body.deleteImages
        await campground.updateOne({$pull:{image:{filename:{$in:req.body.deleteImages}}}})
    }
    await campground.save();
    req.flash('success','Successfully Updated Campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground=async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id)
    await Campground.findByIdAndDelete(id) //this triggers findOneAndDelete middleware (pre,post)
    req.flash('success','Successfully Deleted Campground')
    res.redirect('/campgrounds')
}