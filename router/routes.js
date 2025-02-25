const express = require("express");
const router = express.Router();
const User = require("../model/model.user");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const methodOverride = require("method-override");

router.use(methodOverride("_method")); // Enable method override

// Image upload configuration
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({ storage: storage });

// ✅ INSERT User
router.post("/add", upload.single("image"), async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file ? req.file.filename : null
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

// ✅ UPDATE User (PUT Request)
router.put("/edit/:id", upload.single("image"), async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ type: 'danger', message: 'User not found' });
        }

        // Delete old image if a new one is uploaded
        if (req.file) {
            if (user.image) {
                const oldImagePath = path.join(__dirname, "..", "uploads", user.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Remove old image
                }
            }
            user.image = req.file.filename; // Assign new image
        }

        // Update user fields
        user.name = req.body.name;
        user.email = req.body.email;
        user.phone = req.body.phone;

        await user.save();

        req.session.message = { type: 'success', message: 'Edited successfully' };
        res.redirect("/");
    } catch (error) {
        console.error("Error editing user:", error);
        res.status(500).json({ type: 'danger', message: error.message });
    }
});

// ✅ FIXED: Fetch user before rendering the edit form
router.get("/edit/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render("edit", { title: "Edit User", user });
    } catch (error) {
        console.error("Error fetching user for edit:", error);
        res.status(500).send("Error fetching user");
    }
});

// ✅ GET All Users
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

// ✅ GET Add User Page
router.get("/add", (req, res) => {
    res.render("add_user", { title: "Add User" });
});

// ✅ DELETE User
router.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id);
        
        if (user && user.image) {
            const imagePath = path.join(__dirname, "..", "uploads", user.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Delete image file
            }
        }

        req.session.message = { type: 'success', message: 'User deleted successfully' };
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting user:", err);
        req.session.message = { type: 'danger', message: err.message };
        res.redirect("/");
    }
});

module.exports = router;
