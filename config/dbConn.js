import mongoose from "mongoose"
import { config } from "dotenv";
config();

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("successfully connected to database");
    } 
    catch(err){
        console.log("oope not connected to database")
    }
}

connectDB();