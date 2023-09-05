const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const { mongoClient } = require('./../config/database.js');
const jwt = require('jsonwebtoken');

const userRouter = express.Router();

// MY LIBRARY
const { validateToken } = require('./../mylib/validateToken.js');

userRouter.post('/signup', async (req, res) => {
    
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Find
        const findResult = await mongoClient.db(process.env.DB_NAME).collection('users').findOne({ username: username });

        if(findResult)
            throw new Error('Username already exists');

        // Insert
        const result =  await mongoClient.db(process.env.DB_NAME).collection('users').insertOne({ username, password });

        res.json({
            ok: true,
            uID: result.insertedId
        });
    }
    catch(err) {
        res.json({ ok: false, message: err.message });
    }
});

userRouter.post('/login', async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    try {
        //
        const result = await mongoClient.db(process.env.DB_NAME).collection('users').findOne({ username });
        // { _id: new ObjectId("STRING_ID") }

        // console.log(result);
    
        // console.log(result._id); // new ObjectId("64eaf81b52cbca1010e055d1")
        // console.log(typeof result._id); // object

        if(!result || password !== result.password)
            throw new Error('Username or password is not correct');

        // TOKEN
        const token = jwt.sign({
            uID: result._id // converted to string automatically
        }, process.env.JWT_PRIVATE_KEY);

        res.cookie('token', token, {
            httpOnly: true
        });

        res.json({
            ok: true,
            uID: result._id,
            username: result.username
        });
    }
    catch(err) {
        res.json({ ok: false, message: err.message });
    }
});

userRouter.post('/logout', (req, res) => {
    
    res.cookie('token', '', {
        expires: new Date(Date.now())
    });

    res.json({
        ok: true,
        message: 'Logged out'
    });
});

userRouter.post('/check-find', async (req, res) => {
    
    username = req.body.username;

    const result = mongoClient.db(process.env.DB_NAME).collection('users').find({ username }); // synchronous and returns FindCursor

    console.log(typeof result); // Promise is also a type object (new Promise())
    console.log(result);

    // check iterating if find result is available and check synchonousity
    while (await result.hasNext()) {
        console.log(await result.next());
      }

    res.json({
        ok: true,
        message: typeof result
    });
});

const validatePassword = async function (req, res, next) {

    const password = req.body.password;

    try {
        if(!password)
            throw new Error('Please provide password');
        
        const result = await mongoClient.db(process.env.DB_NAME).collection('users').findOne({ _id: res.locals.uID });

        if(password !== result.password)
            throw new Error('Password is not correct');

        next();
    }
    catch(err) {
        res.json({
            ok: false,
            message: err.message
        });
    }
};

userRouter.post('/change-password', validateToken, validatePassword, async (req, res) => {
    
    const prevPass = req.body.password, newPass = req.body.newPassword;

    try {        
        if(!newPass)
            throw new Error('Missing inputs');
        else if(prevPass === newPass)
            throw new Error('Invalid inputs');
        
        // Getting the uID
        const uID = res.locals.uID;
        // [ Note: Assuming that, uID is valid as it has been checked through validateToken() ]
        
        // Updating new password
        const result = await mongoClient.db(process.env.DB_NAME).collection('users').updateOne({ _id: uID }, { $set: {password: newPass} });

        res.json({
            ok: true,
            message: 'Password has been updated'
        });
    }
    catch(err) {
        res.json({
            ok: false,
            message: err.message
        });
    }
});

userRouter.post('/delete-account', validateToken, validatePassword, async (req, res) => {
    
    try {
        const result = await mongoClient.db(process.env.DB_NAME).collection('users').deleteOne({ _id: res.locals.uID });

        console.log(result);

        res.json({
            ok: true,
            message: 'Account deleted'
        });
    }
    catch(err) {
        res.json({
            ok: true,
            message: err.message
        });
    }
});

userRouter.post('/verify', (req, res) => {
    
    const token = req.cookies.token;

    // if no token, then error.message: 'jwt must be provided'
    
    try {
        const result = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        
        // console.log(result);    // object { payload(uID, iat) }
    
        // console.log(typeof result.uID); // string

        res.json({
            ok: true,
            uID: result.uID
        });
    }
    catch(err)
    {
        res.json({
            ok: false,
            message: err.message
        });
    }
});

module.exports = userRouter;