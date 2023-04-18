const jwt = require("jsonwebtoken");
const User = require("../schemas/user.js")

module.exports = async (req, res, next) => {
    const {Authorization} = req.cookies;

    // authorization 쿠기가 존재하지 않았을 때를 대비
    // ?? : null 병합 문자열 (왼쪽의 값이 비었거나 null일 경우 오른쪽 값으로 대체해준다.
    const [authType, authToken] = (Authorization ?? "").split(" ")

    // authType === Bearer 값인지 확인
    // authToken 검증
    console.log(authType);
    console.log(authToken);
    if(authType !== "Bearer" || !authToken){
        res.status(400).json({
            errroMessage: "로그인 후에 이용할 수 있는 기능입니다."
        });
        return;
    }

    try{
        // 1. authToken이 만료되었는지 확인
        // 2. authToken이 서버가 발급 해준 토큰이 맞는지 검증
        const {userId} = jwt.verify(authToken, "customized-secret-key");

        // 3. authToken에 있는 userId에 해당하는 사용자가 실제 DB에 존재하는 지 확인
        const user = await User.findById(userId);
        res.locals.user = user;
        next(); // 이 미들웨어 다음으로 보낸다.

    }catch(err) {
        console.error(err);
        res.status(400).json({errorMessage: "로그인 후에 이용할 수 있는 기능입니다."});
        return;
    }

}