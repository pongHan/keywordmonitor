const express = require("express");
const session = require('express-session');
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require('body-parser');
const cors = require("cors");
const fs = require('fs');
require('dotenv').config();
const { PORT, PASSPORT_CLIENT_ID, PASSPORT_CLIENT_SECRET } = require("./config.js");

console.log("PORT=" + PORT);

const app = express();

// 세션 설정
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// 뷰 설정
const viewsDistPath = path.join(__dirname, '/views-dist');
const viewsPath = path.join(__dirname, '/views');

if (fs.existsSync(viewsDistPath)) {
  app.set('views', viewsDistPath);
  console.log('Using ./viewsdist for views');
} else {
  app.set('views', viewsPath);
  console.log('Using ./views for views');
}

app.set("view engine", "ejs");
app.set("etag", false);
app.use(express.static('views-dist', {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 라우터 설정
const routers = [
  './router/user.router.js',
  './router/account.router.js',
  './router/org.router.js',
  './router/km_request.router.js',
  './router/km_detect.router.js',
];

routers.forEach(route => {
  const router = require(route);
  app.use("/", router);
});

// 정적 파일 경로 설정
app.use(
  "/script-adminlte",
  express.static(path.join(__dirname, "/node_modules/admin-lte/"))
);
app.use(express.static('public'));
app.use('/img', express.static(path.join(__dirname, '/src/public/img')));

app.use(cors());

app.get('/guide', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'guide.html'));
});

// Passport 설정

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// User 직렬화 및 역직렬화
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const router = express.Router();
const accountController = require('./controllers/account.controller.js');

// // Passport 전략 설정
// passport.use(new GoogleStrategy({
//   clientID: PASSPORT_CLIENT_ID,
//   clientSecret: PASSPORT_CLIENT_SECRET,
//   callbackURL: '/auth/google/callback',
// }, (accessToken, refreshToken, profile, done) => {
//   //console.log("profile=", JSON.stringify(profile, null, 2));
//   console.log(`id=${profile.id}, name=${profile.displayName}`, email=`${profile.emails[0].value}, photo=${profile.photos[0].value}`);
//   //구글id가 없는 경우 회원으로 등록한다 
//   return done(null, profile);
// }));

// 인증 상태 확인 미들웨어
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("isAuthenicated..");

    return next();
  }
  res.redirect('/');
}

// 라우트 설정
app.get('/', (req, res) => {
  //res.send('<a href="/auth/google">Authenticate with Google</a>');
  res.render('login', { user: "", message: [], err: [] });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Store the user data in the session
    req.session.user = {
      mb_id: req.user.id,
      google_id: req.user.id,
      mb_name: req.user.displayName,
      mb_email: req.user.emails[0].value,
      mb_photo: req.user.photos[0].value
    };
    // Directly call the accountController.checkGoogleAccount function
    req.body = { 
      google_id: req.user.id,
      mb_name: req.user.displayName,
      mb_email: req.user.emails[0].value,
      mb_photo: req.user.photos[0].value
    };
    accountController.checkGoogleAccount(req, res);
  }
);

app.get('/profile', ensureAuthenticated, (req, res) => {
  res.send(`<h1>Hello, ${req.user.displayName}</h1><a href="/logout">Logout</a>`);
});

// // 서버 시작
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// 에러 핸들러 추가
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
