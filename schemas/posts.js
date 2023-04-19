const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    content: {
        type: String
    }
});

postsSchema.set("timestamps", { createdAt: true, updatedAt: true });

module.exports = mongoose.model("Posts", postsSchema);