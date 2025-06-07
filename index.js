const express=require("express");
const app=express();
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const dotenv =require("dotenv").config();
const limiter = require("./middleware/rateLimiter");

connectDb();

app.use(express.json());
app.use(limiter);

app.get('/', (req, res) => {
    return res.status(201).json({ msg: "Server is Live!!"});
});

app.use('/api/v1/auth',require('./routes/authRoutes'));
app.use("/api/v1/chapters", require("./routes/chaptersRoutes"));
app.use(errorHandler);

const port=process.env.PORT || 8080;
app.listen(port,()=>{
    console.log(`server is listening to port ${port}`);
});