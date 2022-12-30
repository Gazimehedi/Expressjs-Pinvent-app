const express = require('express');
const app = express();
require('dotenv').config();
const helmet = require('helmet');
const mongoose =require('mongoose');
mongoose.set('strictQuery', true);
const morgan = require('morgan');
const cors = require('cors');
const {readdirSync} = require('fs');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorMiddleware');


// Middlewarea
app.use(helmet());
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
app.use(morgan("dev"));
app.use(cors());

readdirSync('./routes').map(r => app.use('/api/v1', require(`./routes/${r}`)));

// Error Middleware
app.use(errorHandler);
// Database Connection 
mongoose
    .connect(process.env.DATABASE)
    .then(() => console.log('database connected'))
    .catch((err) => console.log('DB error => ', err.message));

// Server
const port = process.env.PORT || 8000;
app.listen(port, (req,res) => {
    console.log(`App run at ${port} port`);
});