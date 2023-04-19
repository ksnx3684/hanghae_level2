const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    comment: {
        type: String
    }
});

commentsSchema.set("timestamps", { createdAt: true, updatedAt: true });

module.exports = mongoose.model("Comments", commentsSchema);