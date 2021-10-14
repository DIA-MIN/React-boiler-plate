const express = require('express');
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser');
const {User} = require('./models/User');
const {auth} = require('./middleware/auth');
const config = require('./config/key');

// application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// application/json
app.use(express.json());

app.use(cookieParser());

// MongoDB Connect
const mongoose = require('mongoose');
mongoose
  .connect(config.mongoURI)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => res.send('리액트 조아아~!'));

/**
 * 회원 가입
 */
app.post('/api/users/register', (req, res) => {
  // 회원 가입 할때 필요한 정보들을 client에서 가져오면
  // 그것들을 디비에 넣어준다
  const user = new User(req.body);
  user.save((err, doc) => {
    if (err) {
      return res.json({success: false, err});
    }
    return res.status(200).json({success: true});
  });
});

/**
 * 로그인
 */
app.post('/api/users/login', (req, res) => {
  // 요청된 이메일을 디비에 있는지 찾는다.
  User.findOne({email: req.body.email}, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '이메일에 해당하는 유저가 없습니다.',
      });
    }
    // 요청된 이메일이 디비에 있다면 비밀번호가 맞는 비밀번호인지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 틀렸습니다.',
        });
      }
      // 비밀번호 까지 맞다면 토큰을 생성하기.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
        res
          .cookie('x_auth', user.token)
          .status(200)
          .json({loginSuccess: true, userId: user._id});
      });
    });
  });
});

/**
 * Auth
 */
// role 1 어드민   role 2 특정 부서 어드민
// role 0 -> 일반유저   role 0이 아니면 관리자
app.get('/api/users/auth', auth, (req, res) => {
  // 여기 까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True 라는 말.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    {_id: req.user._id},
    {
      token: '',
    },
    (err, user) => {
      if (err) return res.json({sucess: false, err});
      return res.status(200).send({
        success: true,
      });
    }
  );
});

app.listen(port, () => console.log(`Example ${port}`));
