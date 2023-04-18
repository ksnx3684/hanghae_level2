const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const postsRouter = require("./routes/posts.js");
const commentsRouter = require("./routes/comments.js");
const authRouter = require("./routes/auth.js");
const connect = require("./schemas");
connect();

app.use(express.json());
app.use(cookieParser());
app.use("/", [authRouter]);
app.use("/posts", [postsRouter, commentsRouter]);

app.listen(port, () => {
  console.log("Server open on port", port);
});
