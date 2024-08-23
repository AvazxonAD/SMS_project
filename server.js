const express = require('express');
const cors = require('cors'); // CORS ni import qiling
const app = express();

require('dotenv').config();

require('colors')
require('./utils/create.user')();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
  
  app.options('*', cors(corsOptions));
  
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Specific origin kiritish mumkin
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
    }
    next();
  });
  

app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.use('/auth', require('./routes/auth.route'))
app.use('/client', require('./routes/client.router'))
app.use('/sms', require('./routes/sms.route'))
app.use('/report', require('./routes/report.router'))
app.use('/region', require('./routes/region.router'))
app.use('/xorazm', require('./routes/sms.xorazm.router.js'))

app.use(require('./middlewares/errorHandler'))

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
