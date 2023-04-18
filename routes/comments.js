const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;


// 댓글 생성 API
const Comments = require('../schemas/comments.js');
router.post('/posts/:_postId/comments', async (req, res) => {

    const {_postId} = req.params;

    try{
        let check = new ObjectId(_postId); // ObjectId 형식 검사
        let underId = check.toString();
        const {user, password, content} = req.body;

        if(
            underId.length !== 24 ||
            !user ||
            !password
        ){
            return res.status(400).json({
                message: "데이터 형식이 올바르지 않습니다."
            });
        }

        if(!content){
            return res.status(400).json({
                message: "댓글 내용을 입력해주세요."
            })
        }

        await Comments.create({_postId, user, password, content});
    }catch(err) {
        return res.status(400).json({
            message: "데이터 형식이 올바르지 않습니다."
        });
    }

    res.json({ message : "댓글을 생성하였습니다." });

});


// 댓글 목록 조회 API
router.get('/posts/:_postId/comments', async (req, res) => {

    const {_postId} = req.params;

    if(_postId.length !== 24){
        return res.status(400).json({
            message: "데이터 형식이 올바르지 않습니다."
        });
    }

    try{
        const comments = await Comments.find({_postId: _postId});

        const results = comments.map((data) => {
            return {  
                commentId: data._id,
                user: data.user,
                content: data.content,
                createdAt : data.createdAt   
            };
        });

        res.status(200).json({ data: results });
    }catch(err) {
        return res.status(400).json({
            message: "데이터 형식이 올바르지 않습니다."
        });
    }

});


// 댓글 수정 API
router.put('/posts/:_postId/comments/:_commentId', async (req, res) => {

    const {_postId, _commentId} = req.params;
    const {password, content} = req.body;

    if(
        _postId.length !== 24 ||
        _commentId.length !== 24 ||
        !password
    ){
        return res.status(400).json({
            message: "데이터 형식이 올바르지 않습니다."
        });
    }

    if(!content){
        return res.status(400).json({
            message: "댓글 내용을 입력해주세요."
        })
    }

    try{
        const comments = await Comments.find({_postId: _postId, _id: _commentId});

        if(!comments.length){
            return res.status(404).json({
                message: "댓글 조회에 실패하였습니다."
            });
        } else {
            await Comments.updateOne(
                {_id:  _commentId, password: password},
                {$set: {content: content}}
            )
        }
    }catch(err) {
        return res.status(400).json({
            message: "데이터 형식이 올바르지 않습니다."
        });
    }
    
    res.status(200).json({message: "댓글을 수정하였습니다."});

});


// 댓글 삭제 API
router.delete('/posts/:_postId/comments/:_commentId', async (req, res) => {

    const {_postId, _commentId} = req.params;
    let {password} = req.body;

    if(
        _postId.length !== 24 ||
        _commentId.length !== 24 ||
        !password
    ){
        return res.status(400).json({
            message: "데이터 형식이 올바르지 않습니다."
        });
    }

    try{
        const comments = await Comments.findOne({_postId: _postId, _id: _commentId});

        if(comments === null){
            return res.status(404).json({
                message: "댓글 조회에 실패하였습니다."
            });
        } else {
            const comment = JSON.parse(JSON.stringify(comments));
            password = password.toString();
    
            if(comment.password === password){
                await Comments.deleteOne({_id: _commentId});
                return res.status(200).json({
                    message: "댓글을 삭제하였습니다."
                })
            } else {
                return res.status(400).json({
                    message: "비밀번호가 일치하지 않습니다."
                })
            }        
        }
    }catch(err) {
        return res.status(400).json({
            message: "데이터 형식이 올바르지 않습니다."
        });
    }
    
});


module.exports = router;