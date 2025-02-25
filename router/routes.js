const express = require("express");
const router = express.Router();
const User = require("../model/model.user");
const session=require("express-session");
const multer = require("multer");
const fs = require("fs");

// Image upload
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const dir = './uploads';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({ storage: storage }).single("image");

// Inserting user into database
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename
        });
        await user.save();
        req.session.message = { type: 'success', message: 'A new user added successfully' };
        res.redirect("/");
    } catch (error) {
        console.error("Error adding user:", error);
        req.session.message = { type: 'danger', message: error.message };
        res.redirect("/");
    }
});

// Fetch users from MongoDB
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.render("index", { 
            title: "Home", 
            users: users, 
            message: req.session.message || null
        });
        req.session.message = null;
    } catch (err) {
        console.error("Error fetching users:", err);
        res.render("index", { 
            title: "Home", 
            users: [], 
            message: { type: "danger", message: "Error loading users" } 
        });
    }
});

router.get("/add", (req, res) => {
    res.render("add_user", { title: "Add User" });
});

// Deleting user by ID
router.get("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await User.findByIdAndDelete(id);
        res.redirect("/");
        req.session.message = { type: 'success', message: 'User deleted successfully' };
       
    } catch (err) {
        console.error("Error deleting user:", err);
        req.session.message = { type: 'danger', message: err.message };
        res.redirect("/");
    }
});

module.exports = router;
