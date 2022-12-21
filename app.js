require('dotenv').config()
require('./config/database').connect()
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const User = require('./model/user')
const auth = require('./middleware/auth')

const app = express();
app.use(express.json());
app.use(cookieParser())


app.get('/', (req, res) => {
    res.send("<h1>Auth system section</h1>")
})

app.post('/register',async (req, res) => {
    try{
        const {firstname, lastname, email, password} = req.body;

        if(!(email && password && firstname && lastname)){
            res.status(400).send('All filed are required!')
        }
    
        const exsistingUser = await User.findOne( {email} ) // PROMISE
    
        if (exsistingUser) {
            res.status(401).send('user Already exsist!')
        }
    
        const myEncribtPassword = await bcrypt.hash(password, 10)
    
        const user = User.create({
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: myEncribtPassword
        })
    
        const token = jwt.sign(
            {user_id: user._id, email},
            process.env.SECRET_KEY,
            {
                expiresIn: "2h"
            }
        )
    
        user.token = token
        user.password = undefined
        res.status(201).json(user)
    } catch(error) {
        console.log(error)
    }
})

app.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body
        if(!(email && password)) {
            res.status(401).send("Please fill all boxes")
        }

        const user = await User.findOne({email})

        if(!user) {
            res.status(401).send("you are not registered")
        }

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                {user_id: user._id, email},
                process.env.SECRET_KEY,
                {
                    expiresIn: "2h"
                }
            )

            user.token = token
            user.password = undefined
            // res.status(200).json(user)

            // if you want to use cookies
            const option = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.status(200).cookie('token', token, option).json({
                success: true,
                token,
                user
            })
        }

        res.status(401).send("your Email or Password is not correct")


    } catch(error){
        console.log(error)
    }
})

app.get('/dashboard', auth, (req, res) => {
    res.send("<h1>welcome to SECRET information</h1>")
})


module.exports = app