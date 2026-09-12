const Listing=require("../models/listing");
const Review=require("../models/review");
module.exports.createReview=async(req,res)=>{
    // console.log(req.params.id);
    let listing=await Listing.findById(req.params.id);
    
    let newReview= new Review(req.body.review);
     newReview.author = req.user._id; 
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
      req.flash("success", "new review created successfully!");
    res.redirect(`/listings/${listing._id}`);
}
module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;

    // Remove review ID from Listing
    await Listing.findByIdAndUpdate(
        id,
        { $pull: { reviews: reviewId } }
    );

    // Delete review document
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully!");

    res.redirect(`/listings/${id}`);
};