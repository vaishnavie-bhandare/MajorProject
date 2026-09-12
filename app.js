// if(process.env.NODE_ENV !="production"){
// require ("dotenv")
// .config();}
require("dotenv").config();
// console.log("ATLAS URL loaded:", !!process.env.ATLASDB_URL);

const express =require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const Listing=require("./models/listing.js");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const { default: next } = require("next");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema,reviewSchema }=require("./schema.js");
const Review=require("./models/review.js");


const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");
const userRouter=require("./routes/user.js")

const session=require("express-session");
const {MongoStore}=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

// const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;
    main().then(
        ()=>{
        console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    });

   async function main(){
    await mongoose.connect(dbUrl);
   }
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    }
    ,
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("ERROR in Mongo SESSION STORE",err);
})

   const sessionOptions={
         store,
        secret:process.env.SECRET,
        resave:false,
        saveUninitialized:true,
        cookie:{
            httpOnly:true,
            expires:Date.now()+1000*60*60*24*7,
            maxAge:1000*60*60*24*7,
        
    }
}

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})
   app.set("view engine","ejs");
   app.set("views",path.join(__dirname,"views"));
   app.use(express.urlencoded({extended:true}));
   app.use(methodOverride("_method"));
   app.engine("ejs",ejsmate);
   app.set("view engine","ejs");
   app.set("views",path.join(__dirname,"views"));
   app.use(express.static(path.join(__dirname,"public")));

// app.get("/",(req,res)=>{
//     res.send("hi ,i am root");
// })
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

 
//   app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"a@gmail.com",
//         username:"developer"
//     })
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
//   })
 app.use("/listings",listings);
 app.use("/listings/:id/reviews",reviews)
 app.use("/",userRouter);


// app.get("/testlisting", async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"my new villa",
//         description:"by the beach",
//         image:"",
//         price:1222,
//         location:"beach",
//         country:"India"

//     })
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfull testing");

// });
app.all("/{*splat}",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));

});
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong"}=err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{err });

});
app.listen(8080,()=>{
    console.log("server is listining on port 8080")
})

