require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { mongoClient } = require('./config/database.js');

const app = express();
const PORT = 80;

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());

// ROUTERS
const userRouter = require('./routers/userRouter.js');
app.use('/user', userRouter);

// CLIENT
// app.use('/assets', express.static(path.join(__dirname, 'client/public')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client/build/index.html'));
// });
app.get('/', (req, res) => {
    res.send('WELCOME!');
});

async function connectToDB()
{
    // console.log(mongoClient);
    await mongoClient.connect();
}

connectToDB().then(() => {

    console.log('Database connected...');

    app.listen(PORT, err => {
        console.log('Server is listening...');
    });

}).catch((err) => {
    console.log('Developer: Something went wrong!');
    console.log(err);
});

// app.listen(PORT, err => {
//     console.log('Server is listening...');
// });