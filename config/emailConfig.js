import nodemailer from "nodemailer"
import { config } from "dotenv";
config();

const transporter = nodemailer.createTransport({
    service : "Gmail",
    auth : {
        user : process.env.EMAIL,
        pass : process.env.EMAIL_PASS
    }
})

export default transporter;