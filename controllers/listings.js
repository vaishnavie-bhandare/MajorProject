const Listing=require("../models/listing");
 module.exports.index=async(req,res)=>{
   const allListings=await  Listing.find({});
 
  res.render("listings/index.ejs",{allListings})
    }
    module.exports.renderform=(req,res)=>{
  
    // if(!req.isAunthenticated()){
    //     req.flash("error","you must be logged in to create listing");
    //     return res.redirect("/login");
    // }
    res.render("listings/new.ejs");
 };
 module.exports.showListing = async(req,res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        });

    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}
 
   module.exports.createListing=async(req,res,next)=>{
      
   let url= req.file.path;
   let filename=req.file.filename;

       const newListing =new Listing(req.body.listing);
         newListing.owner = req.user._id;
    newListing.image={url,filename};

     // Get coordinates from listing location
    const address = `${newListing.location}, ${newListing.country}`;

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
            headers: {
                "User-Agent": "Wanderlust-App"
            }
        }
    );

    const data = await response.json();

    if (data.length > 0) {
        newListing.geometry = {
            type: "Point",
            coordinates: [
                parseFloat(data[0].lon),
                parseFloat(data[0].lat)
            ]
        };
    }
    else {
    newListing.geometry = {
        type: "Point",
        coordinates: [0, 0]
    };
}

 await newListing.save();
    req.flash("success", "Listing created successfully!");
      res.redirect("/listings");}

      module.exports.edit= async(req,res)=>{
           let {id} =req.params;
            const listing= await Listing.findById(id);
            if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
           return res.render("listings/edit.ejs",{listing});}
            let originalImageUrl=listing.image.url;
           originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250")
            res.render("listings/edit.ejs",{listing,originalImageUrl});
       };
      module.exports.update= async(req,res)=>{
           if(!req.body.listing){
               throw new ExpressError(400,"send valid data for listing")}
    
                    let {id}=req.params;
                   let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
                   
                   if(typeof req.file!=="undefined"){
                   let url= req.file.path;
   let filename=req.file.filename;
   listing.image={url,filename};
    await listing.save();}
                      req.flash("success", "Listing updated successfully!");
                    res.redirect(`/listings/${id}`);
           }

           module.exports.destroy= async(req,res)=>{
             let{id}=req.params;
             let deletedListing=await Listing.findByIdAndDelete(id);
           //   console.log(deletedListing);
               req.flash("success", "Listing deleted successfully!");
             res.redirect("/listings");
           }
