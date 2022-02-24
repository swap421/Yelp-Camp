const express=require('express')
const router=express.Router();
const catchAsync=require('../utils/catchAsync')
const Campground=require('../models/campground')
const {isLoggedIn,validateCampground,isAuthor}=require('../middleware')//Destructuring middleware
const {storage}=require("../cloudinary/index") //requiring CloudinaryStorage instance we created in cloudinary folder
const campgrounds=require('../controllers/campground') //importing campgrounds object from controller/campground file
//multer middleware helps in parsing req.body of multipart/form-data encoding type forms
const multer=require('multer')
//below we are setting the path where files will be uploaded
const upload=multer({storage}) //passing storage instance of cloudinaryStorage to store files in cloudinary

//In router.route,we can add different types of request for same path 

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))
    // upload.single/array comes from multer , image is field name that we have set in our input field of forms as name attribute
    // we use req.file for upload.single and req.files for upload.array
   

router.get('/new',isLoggedIn,campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm))

module.exports=router