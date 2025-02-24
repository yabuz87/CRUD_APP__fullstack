const express = require("express");
const router = express.Router();
const User = require("../model/model.user"); // Ensure correct model import

router.get("/", async (req, res) => {
    try {
        const users = await User.find(); // Fetch users from MongoDB
        res.render("index", { 
            title: "Home", 
            users: users, //  Pass users array to the template
            message: req.session.message || null
        });
        req.session.message = null; // Clear message after displaying
    } catch (err) {
        console.error("Error fetching users:", err);
        res.render("index", { 
            title: "Home", 
            users: [], 
            message: { type: "danger", message: "Error loading users" } 
        });
    }
});

router.get("/delete/:id",async(req,res)=>{
try {
    
    const id=req.params.id;
    await User.findByIdAndDelete(id);
    req.session.json({type:'success',message:'user deleted successfully'});

} catch (error) {
    
    res.session.json({type:'danger',message:err.message});
}
})

module.exports = router;
