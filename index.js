import express from 'express'
import dotenv from 'dotenv'
import mysql from 'mysql'
import bp from 'body-parser'

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
    res.send('my Server is running')
})

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

app.post('/users',function(req,res){
    const {id,name,email} = req.body
    mydb.query('insert into users (id,name,email) values(?,?,?)',[id,name,email],(err,results)=>{
        if(err) throw new Error(err)
        res.json({message: 'Added a user',results})
    })
    
})
app.put('/users/:id',function(req,res){
    const id = req.params.id;
    const {name,email} = req.body
    mydb.query('UPDATE users SET name=?,email=? WHERE id =?'
        ,[name,email,id],(err,results)=>{
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


app.get('/users/:id', function(req,res){
    const id = req.params.id
    mydb.query('select * from users where id = ?',[id],(error,results)=>{
          if(error) throw new Error(error)
        res.json({message: 'Added a user',results})
    })
})

app.put('/users/:id', function(req,res){
    const id = req.params.id;
        const {name,age,salary,isActive} = req.body
    mydb.query('UPDATE users SET name=?, age=?, salary=?, isActive=? WHERE id =?'
        ,[name,age,salary,isActive,id],(err,results)=>{
             if(err) throw new Error(err)
        res.json({message: 'updated a user',results})
        })
})


// app.delete

app.delete('/users/:id', function(req,res){
    const id = req.params.id
    mydb.query('DELETE from  users where id= ?',[id],(err,results)=>{
        if(err) throw new Error(err)
                    res.json({message: 'deleted a user',results})

    })
})


app.listen(process.env.PORT, function(){
    console.log('server is running on port 5000')
})