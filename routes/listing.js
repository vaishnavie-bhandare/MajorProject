const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const { listingSchema,reviewSchema }=require("../schema.js");
const Listing=require("../models/listing.js")
const{ isLoggedIn}=require("../middleware.js")

const multer  = require('multer')
const {storage}=require("../cloudConfig.js")
const upload = multer({ storage })
// const listingController=require("../controllers/listing.js");
 
const listingController=require("../controllers/listings.js")


const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
  
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else
    next();
    };
    const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
  
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else
    next();
    };
//new route
router.get("/new",isLoggedIn,listingController.renderform)
 

    router.route("/")
    .get(wrapAsync(listingController.index))
     .post(
        isLoggedIn,
   
    upload.single('listing[image]'),
     validateListing,
     wrapAsync(listingController.createListing))
    


    router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn,
         upload.single('listing[image]'),
        validateListing,
    wrapAsync(listingController.update))
    .delete( isLoggedIn,wrapAsync(listingController.destroy))
    
 


  


 //efit route
 router.get("/:id/edit",isLoggedIn, wrapAsync(listingController.edit));
 
   
    

 
 module.exports=router;