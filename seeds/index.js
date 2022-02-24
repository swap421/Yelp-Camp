const express=require('express')
const app=express()
const cities=require('./cities')
const {places,descriptors}=require('./seedHelpers')
const path=require('path')
const mongoose=require('mongoose')
const Campground=require('../models/campground')
mongoose.connect('mongodb://localhost:27017/yelp-camp')
const db=mongoose.connection
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',()=>{
    console.log('Database Connected')
})
const sample=(array)=>array[Math.floor(Math.random()*array.length)];


const seedDB=async()=>{
    //Emptying the campground Collections before filling with new
    await Campground.deleteMany({})
    for(let i=0;i<300;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:"61c2edc81d4de5338da0db38",
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
            geometry:{ type: 'Point', coordinates: [cities[random1000].longitude,cities[random1000].latitude]},
            price,
            image:[
                {
                  url: 'https://res.cloudinary.com/dbi5lky5f/image/upload/v1640519190/YelpCamp/renkd14mukw3cmrra3oa.jpg',
                  filename: 'YelpCamp/renkd14mukw3cmrra3oa'
                },
                {
                  url: 'https://res.cloudinary.com/dbi5lky5f/image/upload/v1640519190/YelpCamp/htwfhclkcdurlrfkc4k9.jpg',
                  filename: 'YelpCamp/htwfhclkcdurlrfkc4k9'
                }
              ]
        })
        await camp.save()
    }
}
seedDB().then(()=>{
    mongoose.connection.close()
})