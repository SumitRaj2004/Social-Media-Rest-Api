import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    avatar : {
        public_id : {type : String, default : "sample_id"},
        url : {type : String, default : "samele_url"}
    },
    email : {
        type : String,
        required :true
    },
    password : {
        type : String,
        required : true
    },
    followers : [
        {
            user : {type : mongoose.Schema.Types.ObjectId, ref : "User"}
        }
    ],
    followings : [
        {
            user : {type : mongoose.Schema.Types.ObjectId, ref : "User"}
        }
    ]
})

const User = mongoose.model("User", userSchema);

export default User;