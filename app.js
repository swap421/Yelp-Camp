const express=require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const ejsMate=require('ejs-mate')
const ExpressError=require('./utils/ExpressError')
const methodOverride=require('method-override')
const Campground=require('./models/campground')
const Review=require('./models/review')
const {campgroundSchema,reviewSchema}=require('./schemas.js')
const mongoSanitize = require('express-mongo-sanitize');

const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user')

//process.env.NODE_ENV is either developement or in production
if (process.env.NODE_ENV!='production'){
    require('dotenv').config()
}
//accessing key secret in env file using dotenv
// console.log(process.env.secret)
const userRoutes=require('./routes/users')
const campgroundRoutes=require('./routes/campgrounds')
const reviewRoutes=require('./routes/reviews')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
const db=mongoose.connection
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',()=>{
    console.log('Database Connected')
})


app.engine('ejs',ejsMate)
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')


//To parse req.body
app.use(express.urlencoded({extended:true}))

app.use(methodOverride('_method'))
//express-mongo-Sanitize removes key from req.query,params,and body containing special characters like '$' or '.'
//we can also replace instead of removing keys by using replaceWith inside mongoSanitize 
app.use(mongoSanitize({
    replaceWith:'_'
}))
//Setting up Session
const sessionConfig={
    secret:'thismustbeabettersecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //cookies are stored only on http secured (https) if secure:true
        // secure:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
//Setting up Flash
app.use(flash())

//To initialize Passport
app.use(passport.initialize())
//To use session for persistent login, session should be before passport.session to work
app.use(passport.session())
//Passport is using LocalStrategy to authenticate User
passport.use(new LocalStrategy(User.authenticate()))
//Putting Users in Session in serial Manner
passport.serializeUser(User.serializeUser())
//Taking out Users out of Session
passport.deserializeUser(User.deserializeUser())

//We can use success as local Variable in every Template due to res.locals middleware
app.use((req,res,next)=>{
    console.log(req.query)
    //req.user is added by passport after login 
    res.locals.currentUser=req.user
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next();
})

app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)



//Serving Static Directory (We can use js file directly using script tag or any other file)
app.use(express.static(path.join(__dirname,'public')))

// app.get('/fakeuser',async(req,res)=>{
//     const user=new User({email:'colttt@gmail.com',username:'colttt'})
//     //passport provides Inbuilt method to register new instance of User,We pass instance and password
//     const newUser=await User.register(user,'chicken');
//     res.send(newUser)
// })
app.get('/',(req,res)=>{
    res.render('home')
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not found',404))
})
app.use((err,req,res,next)=>{
    const {statusCode=500}=err
    if(!err.message){
        err.message='Something went Wrong'
    }
    res.status(statusCode).render('error',{err})
})
app.listen(3000,()=>{
    console.log('Serving on port 3000')
})
