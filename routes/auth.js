const express = require("express");
const router = express.Router();
const User = require("../schemas/user.js");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware.js");


// 회원가입 API
router.post('/signup', async (req, res) => {
    const {nickname, password, confirm} = req.body;
    try{
        // 닉네임 형식 검사
        let nicknameCheck = /^[a-zA-Z0-9]{3,}$/ // 최소 3자 이상, 알파벳 대소문자, 숫자로 구성
        if(!nicknameCheck.test(nickname)){
            res.status(412).json({
                errorMessage: "닉네임의 형식이 일치하지 않습니다."
            });
            return;
        }

        // 패스워드 및 패스워드 확인
        if(password !== confirm){
            res.status(412).json({
                errorMessage: "패스워드가 일치하지 않습니다."
            });
            return;
        }

        // 패스워드 형식 검사
        // 최소 4자 이상, 닉네임과 같은 값이 포함된 경우 회원가입에 실패
        let pw = password.toString();
        if(pw.length < 4){
            res.status(412).json({
                errorMessage: "패스워드가 형식이 일치하지 않습니다."
            });
            return;
        } else if(pw.includes(nickname)){
            res.status(412).json({
                errorMessage: "패스워드에 닉네임이 포함되어 있습니다."
            });
            return;
        }

        // 닉네임 중복 확인
        const existsNick = await User.findOne({nickname});
        if(existsNick) {
            res.status(412).json({
                errorMessage: "중복된 닉네임입니다."
            });
            return;
        }

        const user = new User({nickname, password});
        await user.save();

        res.status(201).json({
            message: "회원 가입에 성공하였습니다."
        })
    } catch(err) {
        res.status(400).json({
            errorMessage: "요청한 데이터 형식이 올바르지 않습니다."
        });
        return;
    }
});


// 로그인 API
router.post('/login', async (req, res) => {
    const {nickname, password} = req.body;
    try{
        const user = await User.findOne({nickname});

        // DB에 닉네임이 없거나 사용자가 입력한 비밀번호와 일치하지 않은 경우
        if(!user || user.password !== password){
            res.status(412).json({
                errorMessage: "닉네임 또는 패스워드를 확인해주세요."
            })
            return;
        }

        // jwt 생성
        const token = jwt.sign({userId: user.userId}, "customized-secret-key");
        // 쿠키 생성
        res.cookie("Authorization", `Bearer ${token}`);
        res.status(200).json({token});
    } catch(err) {
        res.status(400).json({
            errorMessage: "로그인에 실패하였습니다."
        })
    }
});

module.exports = router;