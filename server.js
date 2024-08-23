const express = require('express');
const cors = require('cors'); // CORS ni import qiling
const app = express();

require('dotenv').config();

require('colors')
require('./utils/create.user')();
  
const corsOptions = {
  origin: 'http://147.45.107.174:3001', // Kiritilgan domenni ruxsat eting
  methods: ['GET', 'POST'], // POST so'rovini ruxsat eting
  allowedHeaders: ['Content-Type', 'Authorization'] // Talab qilinadigan headerlarni ruxsat eting
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
