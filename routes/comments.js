const express = require("express");
const router = express.Router();
const Comment = require("../schemas/comments");
const authMiddleware = require("../middlewares/auth-middleware");
const Post = require("../schemas/posts");

// 댓글 생성
router.post("/:_postId/comments", authMiddleware, async (req, res) => {
  const { _postId } = req.params;
  const { comment } = req.body;
  const { nickname, _id } = res.locals.user;

  if (req.body.length === 0) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ errorMessage: "댓글 내용을 입력해주세요." });
  }

  try {
    const post = await Post.findById(_postId);
    if (!post)
      return res
        .status(403)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    await Comment.create({
      postId: _postId,
      userId: _id,
      nickname: nickname,
      comment: comment,
    });
    res.status(200).json({ message: "댓글을 작성하였습니다." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." });
  }
});

// 댓글 조회
router.get("/:_postId/comments", async (req, res) => {
  const { _postId } = req.params;
  try {
    const post = await Post.findOne({ _id: _postId });
    if (!post)
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    const comments = await Comment.find({
      postId: _postId,
    }).select("-postId -__v");
    const data = {
      comments: comments.map((a) => {
        return {
          commentId: a._id,
          userId: a.userId,
          comment: a.comment,
          nickname: a.nickname,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        };
      }),
    };
    res.status(200).json(data);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다." });
  }
});

// 댓글 수정
router.put(
  "/:_postId/comments/:_commentId",
  authMiddleware,
  async (req, res) => {
    const { _postId, _commentId } = req.params;
    const { comment } = req.body;
    const { _id } = res.locals.user;
    if (
      Object.keys(req.body).length === 0 ||
      Object.values(req.params).length === 0
    ) {
      return res
        .status(412)
        .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }
    if (comment.trim() === "" || undefined) {
      return res
        .status(400)
        .json({ errorMessage: "댓글 내용을 입력해주세요." });
    }

    try {
      const post = await Post.findOne({ _id: _postId });
      if (!post) {
        return res
          .status(404)
          .json({ errorMessage: "게시글이 존재하지 않습니다." });
      }

      const existComment = await Comment.findById(_commentId);
      if (!existComment) {
        return res
          .status(404)
          .json({ errorMessage: "댓글이 존재하지 않습니다." });
      }

      if (existComment.userId !== _id.toString()) {
        return res
          .status(403)
          .json({ errorMessage: "게시글 수정 권한이 존재하지 않습니다." });
      }
      await Comment.updateOne(
        { _id: _commentId },
        { $set: { comment: comment } }
      ).catch((err) => {
        res.status(400).json({
          errorMessage: "댓글 수정이 정상적으로 처리되지 않았습니다.",
        });
      });
      res.status(200).json({ message: "댓글을 수정하였습니다." });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: "댓글 수정에 실패하였습니다." });
    }
  }
);

// 댓글 삭제
router.delete(
  "/:_postId/comments/:_commentId",
  authMiddleware,
  async (req, res) => {
    const { _postId, _commentId } = req.params;
    const { comment } = req.body;
    const { _id } = res.locals.user;

    try {
      const post = await Post.findOne({ _id: _postId });
      if (!post) {
        return res
          .status(404)
          .json({ errorMessage: "게시글이 존재하지 않습니다." });
      }

      const existComment = await Comment.findById(_commentId);
      if (!existComment) {
        return res
          .status(404)
          .json({ errorMessage: "댓글이 존재하지 않습니다." });
      }

      if (existComment.userId !== _id.toString()) {
        return res
          .status(403)
          .json({ errorMessage: "댓글의 삭제 권한이 존재하지 않습니다." });
      }
      await Comment.deleteOne({ _id: _commentId }).catch((err) => {
        res.status(400).json({
          errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다.",
        });
      });
      res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } catch (error) {
      res.status(400).json({ message: "댓글 삭제에 실패하였습니다." });
    }
  }
);
module.exports = router;
