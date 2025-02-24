require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const session=require("express-session")


const app = express();
const port = process.env.PORT||3000;
const db = mongoose.connection;
const routeAPI=require("./router/routes");
// Fix: Correct mongoose connection options
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).catch(err => console.error("MongoDB connection error:", err)); // Handle connection errors
// Handle DB connection events
db.on("error", (err) => console.error("Database connection error:", err));
db.once("open", () => {
    console.log("Connected to database");
});
app.use(express.static('uploads'));


// Fix: Proper middleware usage
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret:"my secret key",
   saveUninitialized: true, // Fixed typo here  
    resave:false
}))
app.use((req,res,next)=>{
    res.locals.message=req.session.message;
    delete req.session.message;
    next();
})
// set template engine
app.set("view engine","ejs");





app.use("/",routeAPI);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
