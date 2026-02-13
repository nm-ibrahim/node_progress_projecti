import express from 'express'
import dotenv from 'dotenv'
import mysql from 'mysql'
import bp from 'body-parser'
import bycryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
app.use(bp.json())

// db mysql connection 
const mydb = mysql.createConnection({
    host:process.env.HOST,
    user: process.env.user,
    password:process.env.PASSWORD,
    database:process.env.DATABASE
})

mydb.connect(function(err){
    if(err) throw new Error(err)
    console.log('Mysql Databse connected')
})

app.get('/',function(req,res){
    try{
        res.status(200).send('my server is running')
    } catch (error){
        res.status(500).send('internal server error')
    }
})

//AUTHENTICATION
//REGISTER CREATE A USER FOR THE FIRST TIME

app.post("/register",function(req,res){
    const {username,email,password} = req.body;
    //check if user is already in the database
    mydb.query('select * from users where email =?',[email],async(err,result)=>{
        if(result.length >0){
            return res.status(500).json({message: 'user already existed',err})
        }
        //hash the password
        const newpasscode = await bycrybtjs.hash(password,10)
         mydb.query('insert into users (username,email,password) values (?,?,?)', [username,email,newpasscode],(err,result)=>{
            if(err) throw new Error (err)
                res.status(201).json({message: 'user created successfully', result})
        })
    })
   
})

app.post("/login", function (req, res) {
    const { email, password } = req.body;

    mydb.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ message: "DB error" });

            if (results.length === 0) {
                return res.status(404).json({ message: "user not found" });
            }

            const user = results[0];

            const matchedPassword = await bycryptjs.compare(password, user.password);

            if (!matchedPassword) {
                return res.status(401).json({ message: "invalid credentials" });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.status(200).json({message: "login successful",token});
        }
    );
});

//middleware to verify token

const verifytoken=(req,res,next)=>{
    const authheader =req.headers['authorization']
    if(!authheader) return res.status(401).json({message:'no token provided'})

    const token = authheader.split(' ')[1]
    if(!token) return response.status(401).json({message:'no token provided'})

    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err) return res.status(401).json({message:'invalid token'})
        req.user = decoded //attach our user to a request
    next()//execute our real API function after these checks//allow request
    })
}

// GET all users(students)

app.get('/users',function(req,res){

    mydb.query('select * from users',(err,results)=>{
        if(err) throw new Error(err)
        res.json({message: 'Got users ',results})
    })
})

app.get('/users/:id', function(req,res){
    const id =req.params.id
    mydb.query('select * from users where id = ?', [id],(err,results)=>{
          if(err) throw new Error(err)
        res.json({message: 'Got users ',results})
    })

})
app.put('/users/:id',verifytoken,function(req,res){
    const id = req.params.id;
    const {username,email,password} = req.body
    mydb.query('UPDATE users SET username=?,email=?,password=? WHERE id =?'
        ,[username,email,password,id],(err,results)=>{
        if(err) throw new Error(err)
        res.json({message: 'updated a user',results})
    })
    
})

app.delete('/users/:id', function(req,res){
    const id =req.params.id
    mydb.query('DELETE from users where id = ?', [id],(err,results)=>{
          if(err) throw new Error(err)
        res.json({message: 'delete users ',results})
    })

})


app.listen(process.env.PORT, function(){
    console.log('server is running on port 5000')
})