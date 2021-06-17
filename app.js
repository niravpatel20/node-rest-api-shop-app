const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'), {flags: 'a'});

const dbURL = 'mongodb+srv://node-shop:'+process.env.MONGO_ATLAS_PWD+'@node-shop.p0tvv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(dbURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true
}, () => {
    console.log("DB Connected!");
});

const app = express();


app.use(morgan('short',{
    stream : accessLogStream
}));

app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if(req.method === "OPTIONS"){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, PATCH');
        res.status(200).json({});
    }
    next();
})

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found!');
    error.status = 400;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status||500).json({
        message: error.message
    })
})

module.exports = app ;