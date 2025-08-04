const express = require("express");
const app = express();
const port = 8000;
const dbConnection = require("./config/dbConnection");
const cors = require("cors");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const productRoutes = require("./routes/productRoutes");
const UserRoutes = require("./routes/userRoutes");
const helmet = require("helmet");
const {apiLimiter} = require("./middleware/rateLimiter");



app.use(cors({
    origin:FRONTEND_URL,
    credentials:true,
}));
app.use(apiLimiter);
app.use(express.json());
app.use(helmet());

app.get("/health", (req,res) =>{
    res.send("server is healthy");
})
app.use("/api/users",UserRoutes);
app.use("/api/products",productRoutes);

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})