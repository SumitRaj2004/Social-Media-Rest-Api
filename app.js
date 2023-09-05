import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes.js"
import postRouter from "./routes/postRoutes.js";

const app = express();
app.use(cors({
    origin : "http://127.0.0.1:1000/",
    credentials : true
}))
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser())

app.use("/api/v1", userRouter)
app.use("/api/v1/post", postRouter);
app.use("*", (req, res, next) => {
    res.status(404).json({success : false, message : "page not found"})
})

export default app;
