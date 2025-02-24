const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    image: {
        type: String, // Store the image filename or URL
        required: true
    }
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
