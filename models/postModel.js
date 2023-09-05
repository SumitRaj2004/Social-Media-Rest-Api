import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    caption : {
        type : String,
        required : true
    },
    image : {
        public_id : {type : String, default : "sample_public_id"},
        url : {type : String, default : "sample_url"}
    },
    likes : [
        {
            user : {type : mongoose.Schema.Types.ObjectId, ref : "User"}
        }
    ],
    comments : [
        {
            user : {type : mongoose.Schema.Types.ObjectId, ref : "User"},
            comment : {type : String, required : true}
        }
    ]
}, {
    timestamps : true
})

const Post = mongoose.model("Post", postSchema)

export default Post;