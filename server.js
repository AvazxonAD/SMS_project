const express = require('express');
const cors = require('cors'); // CORS ni import qiling
const app = express();

require('dotenv').config();

require('colors')
require('./utils/create.user')();

const corsOptions = {
    origin: 'https://sms-project-nine.vercel.app', // Bu yerni aniq domen bilan almashtiring
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
  
  app.use(cors(corsOptions));
  
  

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
