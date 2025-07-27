const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session'); // 新增
const exchangeRouter = require('./routes/exchange');
const userRouter = require('./routes/user'); // 新增
const logger = require('./logger');

const app = express();
const port = 3000;

app.use(session({
  secret: 'a8f$2kL!9zQx@1bC7dE#4gH6', // 请替换为安全的密钥
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // 若用 https，改为 true
}));

// 日志中间件，记录每个API请求
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/api/exchanges', exchangeRouter);
app.use('/api/users', userRouter); // 新增

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
  console.log(`Server running at http://localhost:${port}`);
});

