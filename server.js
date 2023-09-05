import app from "./app.js"
import { config } from "dotenv"
config();
import "./config/dbConn.js"
app.listen(process.env.PORT, () => {
    console.log(`server started listening to request on port ${process.env.PORT}`)
})