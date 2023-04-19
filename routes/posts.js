const express = require("express");
const router = express.Router();
const Post = require("../schemas/posts");
const authMiddleware = require("../middlewares/auth-middleware");

// 게시글 작성
router.post("/", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { nickname, _id } = res.locals.user;
  console.log(nickname);
  if (Object.keys(req.body).length === 0) {
    return res
      .status(412)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }
  if (title === "" || title === undefined) {
    return res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
  }
  if (content === "" || content === undefined) {
    return res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
  }

  try {
    const post = new Post({ userId: _id, nickname, title, content });
    await post.save();
    res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

// 게시글 조회
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().select("-__v -content").sort("-createdAt").exec();
    const data = {
      posts: posts.map((a) => {
        return {
          postId: a._id,
          userId: a.userId,
          nickname: a.nickname,
          title: a.title,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        };
      }),
    };
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 상세 조회
router.get("/:_postId", async (req, res) => {
  const { _postId } = req.params;

  try {
    const post = await Post.findById({ _id: _postId }).select("-__v").exec();
    const data = {
      post: {
        postId: post._id,
        userId: post.userId,
        nickname: post.nickname,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 수정
router.put("/:_postId", authMiddleware, async (req, res) => {
  const { _postId } = req.params;
  const { title, content } = req.body;
  const { _id } = res.locals.user;

  try {
    if (
      Object.keys(req.body).length === 0 ||
      Object.values(req.params).length === 0
    ) {
      return res
        .status(412)
        .json({ message: "데이터 형식이 올바르지 않습니다." });
    }
    if (title === "" || title === undefined) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    }
    if (content === "" || content === undefined) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    }
    const post = await Post.findOne({ _id: _postId });
    if (post.userId !== _id.toString()) {
      return res
        .status(403)
        .json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
    }

    await Post.updateOne(
      { _id: _postId },
      { $set: { title: title, content: content } }
    ).catch((err) => {
      res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 수정되지 않았습니다." });
    });
    res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다." });
  }
});

// 게시글 삭제
router.delete("/:_postId", authMiddleware, async (req, res) => {
  const { _postId } = req.params;
  const { _id } = res.locals.user;
  try {
    const post = await Post.findById(_postId);
    if (!post)
      return res
        .status(403)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });

    if (!_id || post.userId !== _id.toString()) {
      return res
        .status(403)
        .json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
    }
    await Post.deleteOne({ _id: _postId }).catch((err) =>
      res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 삭제되지 않았습니다." })
    );
    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
