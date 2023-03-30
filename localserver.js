const express=require("express");
const path=require("path");
const http=require('http');
const app=express();
const socketio=require('socket.io');
const { get } = require("https");
// const formatMsg=require("./utils/message")
// const { userJoin, getCurrentUser }=require('./utils/users');


const server=http.createServer(app);
const io=socketio(server);



const users=[];

//Join user to chat
function userJoin(id, username, room){
    const user={id, username, room}
    users.push(user)
    return user;
}

//[{id, username, room}]
// Get current user
function getCurrentUser(id){
    return users.find(user => user.id === id);
}

//User leaves chat
function userLeave(id){
    const index=users.findIndex(user=>user.id===id);
    if(index!==-1){
        return users.splice(index,1)[0];
    }
}

//Get room users
function getRoomUsers(room){
    return users.filter(user=>user.room===room)
}

// //Setup Express Server
// app.set('views', './FrontEnd')
// app.set('view engine', 'ejs')


//Set static folder
app.use(express.static(path.join(__dirname, 'FrontEnd'))); //Connect script to server

//Accept URL Parameters
// app.use(express.urlencoded({extended: true}))

//Setting up the routes
// const rooms = {}
// app.get('/',(req, res)=>{
//     res.render('index',{rooms: rooms})
// })

// app.get('/:room',(req,res)=>{
//     res.render
// })

//Run when a client connects
io.on('connection', socket=> {

    // socket.on('joinRoom',({username, roomkey})=>{
    //     const user= userJoin(socket.id, username, roomkey);
    //     socket.join(user.roomkey);

    //     //Broadcasting new user connection
    //     socket.broadcast.to(user.roomkey).emit('message',`${user.username} joined the chat`);

    // });

    // socket.emit('message','Welcome to AS');
    
    // //Broadcasting new user connection
    // socket.broadcast.emit('message',formatMsg('USER','New user has joined'));

    // //Run when client disconnects

    socket.on('joinRoom',(getcred)=>{
        console.log(getcred);
        const user=userJoin(socket.id, getcred.usnm, getcred.rmk);
        socket.join(user.room);
        console.log(user);
        socket.broadcast.to(user.room).emit("update", `${user.username} joined the conversation`);
    })

    // socket.on("newuser", function(username){
    //     socket.broadcast.emit("update", username + " joined the conversation");

    //     // socket.on('disconnect',(username)=>{
    //     //     socket.broadcast.emit('update',username + ' left the conversation');
    //     // })
    // });



    // //Listen for chatMessage
    // socket.on('chatMessage', (msg) => {
    //     io.emit('message', formatMsg('USER',msg));
    // })

    // //Run when client disconnects
    // socket.on('exituser',(username)=>{
    //     socket.broadcast.emit('update',username + ' left the conversation');
    // });

    socket.on("chat", function(message){

        const getuser=getCurrentUser(socket.id);

        socket.broadcast.to(getuser.room).emit("chat", message);
    });

    //Run when client disconnects
    socket.on('exituser',(username)=>{

        const getuser=getCurrentUser(socket.id);

        socket.broadcast.to(getuser.room).emit('update',username + ' left the conversation');
    });

    socket.on('disconnect',()=>{

        const getuser=userLeave(socket.id);
        if(getuser){
            socket.broadcast.to(getuser.room).emit('update',`${getuser.username} left the conversation`);
        }
    });

    //File sharing
    socket.on("file-meta", function(data){
        const getuser=getCurrentUser(socket.id);
        socket.broadcast.to(getuser.room).emit("fs-meta",{
            senderid:socket.id,
            meta:data.metadata
        });
    });

    socket.on("fs-start", function(data){
        // const getuser=getCurrentUser(socket.id);
        socket.to(data.sender).emit("fs-share-s",
        {
            receiverid:socket.id
        });
    });
    
    socket.on("file-raw", function(data){
        const getuser=getCurrentUser(socket.id);
        socket.broadcast.to(getuser.room).emit("fs-share-r",data.buffer);
    });


    // socket.on("fs-rcomplete", function(data){
    //     const getuser=getCurrentUser(socket.id);
    //     socket.broadcast.to(getuser.room).emit("fs-show",
    //     {
    //         username: data.metadata.usender,
    //         text: data.metadata.filename,
    //         time: data.metadata.time
    //     });
    // })
    
})

const port=3000;
server.listen(port,()=>{
    console.log("Server running on 3000!");
});
