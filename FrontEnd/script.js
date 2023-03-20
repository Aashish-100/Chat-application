// const { text } = require("express");
// const moment=require('moment');
var socket = io();

// import  {renderMessage}  from '../utils/message';

//Message from server
// socket.on('message',message => {
//     console.log(message);
//     outputMessage(message)

//     //Scroll down

// })

// function outputMessage(message){
//     const div=document.createElement('div');
//     div.classList.add('my-message', 'message');
//     div.innerHTML= `<div><div class="name">${message.usrname} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
//     document.querySelector('.messages').appendChild(div);
// }   


// // Javascript implementation of chat application


// //Checking input vars
// var frmres=document.getElementById("usrinp");



var usn,rk,msgdiv;
window.onload = function(){
    // socket.on('message',message => {
    //     console.log(message);
    //     outputMessage(message)
    
    //     //Scroll down
    msgdiv=document.querySelector('.chatscroll');
    msgdiv.scrollTop=msgdiv.scrollHeight-msgdiv.clientHeight;
    // })
    var username=document.getElementById("username");
    var roomkey=document.getElementById("roomkey");
    // frmres.onclick=function(){
    //     usn=username.value;
    //     rk=roomkey.value;
    // }
    // var username=document.getElementById("username");
    // var roomkey=document.getElementById("roomkey");
    var joinchatroombtn=document.getElementById("joinroom");
    var joinchat = document.getElementById("joinchatscreen");
    var frmres=document.getElementById("usrinp");
    joinchatroombtn.addEventListener("click", function(){
        usn = username.value;
        rk = roomkey.value;
        if (usn.length ==0){
            alert("Please enter a valid username")
            return;
        }
        // Join Room
        // socket.emit('joinRoom', {usn, rk});
        var exitBtnRoom=document.getElementById("extbutn");
        var sendmsgbtn=document.getElementById("send-msg");
        var emojibtn=document.getElementById("button-emoji");
        var inpmsg=document.getElementById("msg-input");
        var attachfiles=document.getElementById("attach-file");
        var chatscreen = document.getElementById("chatscrn");
        var roomkeydisplay = document.getElementById("display-rk");
        var msgf=document.getElementById("msgform");
        joinchat.classList.remove("active");
        chatscreen.classList.add("active");
        var cred={usnm: username.value, rmk: roomkey.value};
        socket.emit('joinRoom', cred);
        // console.log(usn, rk);
        roomkeydisplay.innerHTML = "Room Key: "+"<span class='blurry-text' id='roomk'>"+rk+"</span>"+" <button class='copbutton' id='cpbtn'><i class='fas fa-copy'></i></button>";
        var blurtext = document.getElementById("roomk");
        blurtext.addEventListener("mouseover", function(){
            blurtext.classList.remove("blurry-text");
        })
        blurtext.addEventListener("mouseout", function(){
            blurtext.classList.add("blurry-text");
        
        })
        // Adding the copy to clipboard functionality
        var copybtn=document.getElementById("cpbtn");
        copybtn.onclick=function(){
            roomkey.select();
            roomkey.setSelectionRange(0,99999);
            navigator.clipboard.writeText(rk);
            alert("Copied!");
        }
    
        //Reading message from the user and displaying it 
        msgf.addEventListener('submit', function(e){
            e.preventDefault();
            var getval=new Date;
            var hrs=getval.getHours();
            var mins=getval.getMinutes();
            var time=hrs + ":" + mins;
            var msg=inpmsg.value;
            //Emit a message to a server

            renderMessage("my",{
                username: usn,
                text: msg,
                time: time
            });

            shareFile({
                filename:file.name,
                total_buffer_size:buffer.length,
                buffer_size:1024
            },buffer,el.querySelector(".progress"));

            socket.emit('chat',{
                username: usn,
                text: msg,
                time: time
            });
            msgf.reset();
            // e.target.elements.

        });
        function renderMessage(type,message){
            if (type=="my"){
                const div=document.createElement('div');
                div.classList.add('my-message', 'message');
                div.innerHTML= `<div><div class="name">${message.username} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
                document.querySelector('.messages').appendChild(div);
            } else if (type=="other"){
                const div=document.createElement('div');
                div.classList.add('other-message', 'message');
                div.innerHTML= `<div><div class="name">${message.username} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
                document.querySelector('.messages').appendChild(div);

            } else if(type=="update"){
                const div=document.createElement('div');
                div.classList.add('update');
                div.innerText=message;
                // div.innerHTML= `<div><div class="name">${message.usrname} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
                document.querySelector('.messages').appendChild(div);
            }
        }

        socket.on('update',function(update){
            renderMessage("update",update)
        });

        socket.on("chat",function(message){
            renderMessage("other",message);
        });


        exitBtnRoom.addEventListener('click',function(){
            socket.emit('exituser',usn);
            window.location.href=window.location.href;
        });


        attachfiles.addEventListener("change",(e)=>{
            let file=e.target.files[0];
            if(!file){
                return;
            }
            let reader=new FileReader();
            reader.onload=function(e){
                let buffer = new Uint8Array(reader.result);
                let el =document.createElement("div");
                el.classList.add("progressdiv");
                el.innerHTML=  `
                <div class="progress">0%</div>
                <div class="filename>${file.name}</div>
                `;
                // shareFile({
                //     filename:file.name,
                //     total_buffer_size:buffer.length,
                //     buffer_size:1024
                // },buffer,el.querySelector(".progress"));
            }
            reader.readAsArrayBuffer(file);
        });

        function shareFile(type,metadata,buffer,progress_node){
            if(type=="my"){
                //If type is mine, we will emit the file
                socket.emit("file-meta",{
                metadata:metadata
                });
            }
            else if(type=="other"){
                //do something
            }
            else if(type==update){
                //do something
            }
            // socket.emit("file-meta",{
            //     metadata:metadata
            // });
            // socket.on("fs-share",function(){
            //     let chunk=buffer.slice(0,metadata.buffer_size);
            //     buffer=buffer.slice(metadata.buffer_size,buffer.length);
            //     progress_node.innerText=Math.trunc((metadata.total_buffer_size-buffer.length)/(metadata.total_buffer_size*100)+"%");
            //     if(chunk.length!=0){
            //         socket.emit("file-raw",{
            //             buffer:chunk
            //         });
            //     }
            // });
        }

    })  ;
}

// // var usn,rk=getVals();

// // chatscreen.onload=function(){
// //     console.log(usn,rk);
// // }

//1. Join room





// chatscreen.onload=function(){
//     roomkeydisplay.innerText = "Room Key: "+rkey;
// }

// joinchat.addEventListener("load",function(){
//     var username=document.getElementById("username"); //Gets the tag
//     var roomkey=document.getElementById("roomkey"); //Gets the tag
//     var frmres=document.getElementById("usrinp");
//     var usn,rk;
//     frmres.onsubmit=function(){
//         usn=username.value;
//         rk=roomkey.value;
//     }
//     console.log(usn,rk);
// });