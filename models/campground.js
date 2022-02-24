const mongoose=require('mongoose')
const Review=require('./review')
const Schema=mongoose.Schema;
const ImageSchema=new Schema({
    url:String,
    filename:String
})
//below code is added to add virtuals to campground object when it is converrted to JSON
const opts={toJSON:{virtuals:true}}
//Adding virtual property to Schema
//We add virtual property to schema so that we don't need to store it to database
ImageSchema.virtual('thumbnail').get(function(){
    //this refers to every images
    //w_200 is used to crop the images to 200pixels
    return this.url.replace('/upload','/upload/w_200')
})
const CampgroundSchema=new Schema({
    title:String,
    image:[ImageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    price:Number,
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
},opts)
//Making virtual property for popup in cluster map because mapbox takes data under properties key
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    //this refers to campground
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`
})
//this middleware triggers after findByIdAndDelete method is called for any campground
//this doc is the element which is deleted, it is passed as parameter to function
CampgroundSchema.post('findOneAndDelete',async function(doc){ 
    if(doc){
        await Review.remove({
            _id:{
                $in:doc.reviews
            }
        })
    }                                      
})
module.exports=mongoose.model('Campground',CampgroundSchema)
