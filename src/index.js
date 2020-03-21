const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage , generateLocation} = require('./utils/message')
const {addUser , removeUser , getUser , getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const publicDirPath = path.join(__dirname,'../public')

app.use(express.static(publicDirPath))


io.on('connection',(socket) => {

  socket.on('join',(options,cb) => {

    const {err,user} =  addUser({id: socket.id, ...options})
 

    if (err) {
      return cb(err)
    }

    socket.join(user.room)
    socket.emit('message',generateMessage('Admin',`Okairi ${user.username}`))
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined the room`))
    io.to(user.room).emit('roomData',{
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    cb()

  })  
  
  socket.on('userMessaged',(message,cb) => {

    const user = getUser(socket.id)
    const filter = new Filter()

    if(filter.isProfane(message)){
      return cb('Gomen')
    }
    
    socket.emit('myMessage',generateMessage(user.username,message))

    socket.broadcast.to(user.room).emit('message',generateMessage(user.username,message))

    cb()
  })
  
  socket.on('sendLocation',({lat,long},cb) => {

    const user = getUser(socket.id)

    socket.emit('myLocation',generateLocation(user.username,lat,long))

    socket.broadcast.to(user.room).emit('location',generateLocation(user.username,lat,long))
    
    cb()
  })

  socket.on('disconnect', () => {
    const user  = removeUser(socket.id) 
    console.log(user )
    if(user){
      io.to(user.room).emit('roomData',{
        room: user.room,
        users: getUsersInRoom(user.room)
      })
     io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
    }

  })

})


server.listen(port , () => console.log(`listening on port ${port}`))