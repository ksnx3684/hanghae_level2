const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        unique: true
    },
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    comment: {
        type: String
    }
});

commentsSchema.set("timestamps", { createdAt: true, updatedAt: true });

module.exports = mongoose.model("Comments", commentsSchema);