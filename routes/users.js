const express=require('express')
const router=express.Router()
const User=require('../models/user')
const passport=require('passport')
const catchAsync=require('../utils/catchAsync')
const users=require('../controllers/user')

//In router.route,we can add different types of request for same path 
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

//passport.authenticate is a middleware provided by passport which is using local strategy for authenticating,
// We can use different strategy Google,Facebook
//failureFlash flashes failure message when login fails
router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login)

router.get('/logout',users.logout)

module.exports=router;