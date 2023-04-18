const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        unique: false
    },
    title: {
        type: String
    },
    content: {
        type: String
    },
    createdAt : {
        type: Date,
        default: Date.now()
        }
});

module.exports = mongoose.model("Posts", postsSchema);