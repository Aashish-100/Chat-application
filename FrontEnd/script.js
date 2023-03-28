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


        var file;
        var fileSelected = false;
        attachfiles.addEventListener("change",(e)=>{
            file=e.target.files[0];
            // if(!file){
            //     return;
            // }
            inpmsg.value="Attached: "+file.name;
            inpmsg.readOnly = true;
            fileSelected=true;
            // let reader=new FileReader();
            // reader.onload=function(e){
            //     let buffer = new Uint8Array(reader.result);
            //     let el =document.createElement("div");
            //     el.classList.add("progressdiv");
            //     el.innerHTML=  `
            //     <div class="progress">0%</div>
            //     <div class="filename>${file.name}</div>
            //     `;
            //     // shareFile({
            //     //     filename:file.name,
            //     //     total_buffer_size:buffer.length,
            //     //     buffer_size:1024
            //     // },buffer,el.querySelector(".progress"));
            // }
            // reader.readAsArrayBuffer(file);
        });
    
        //Reading message from the user and displaying it 
        msgf.addEventListener('submit', function(e){
            e.preventDefault();
            var getval=new Date;
            var hrs=getval.getHours();
            var mins=getval.getMinutes();
            var time=hrs + ":" + mins;

            if(fileSelected)
            {
                let reader=new FileReader();
                reader.onload=function(e){
                    let buffer = new Uint8Array(reader.result);
                    // let el =document.createElement("div");
                    // el.classList.add("progressdiv");
                    inpmsg.innerHTML+= '<div class="progress">0%</div>'  
                    // el.innerHTML= `
                    // <div class="progress">0%</div>
                    // <div class="filename>${file.name}</div>
                    // `;

                    //shareFile(type,metadata,buffer,progressnode)
                    var msg=file.name;
                    renderMessage("my",{
                        username: usn,
                        text: msg,
                        time: time
                    });

                    shareFile({
                        usender:usn,
                        time:time,
                        filename:file.name,
                        total_buffer_size:buffer.length,
                        buffer_size:1024
                    },buffer,inpmsg.querySelector(".progress"));
                }
                reader.readAsArrayBuffer(file);
                msgf.reset();
                inpmsg.readOnly = false;
                fileSelected=false;
            }
            else{
                var msg=inpmsg.value;
                //Emit a message to a server

                renderMessage("my",{
                    username: usn,
                    text: msg,
                    time: time
                });

                // shareFile({
                //     filename:file.name,
                //     total_buffer_size:buffer.length,
                //     buffer_size:1024
                // },buffer,el.querySelector(".progress"));

                socket.emit('chat',{
                    username: usn,
                    text: msg,
                    time: time
                });
                msgf.reset();
                // e.target.elements.
            }

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

        // socket.on("fs-show",function(message){
        //     renderMessage("other",message);
        //     console.log("From fs-show");
        //     fileShare={};
        // });

        var fileShare={};
        socket.on("fs-meta",function(metadata){
            fileShare.metadata=metadata.meta;
            fileShare.transmitted=0;
            fileShare.sender=metadata.senderid;
            fileShare.buffer=[];
            socket.emit("fs-start",
            {
                sender:metadata.senderid
            })
        });

        socket.on("fs-share-r",function(buffer){
            fileShare.buffer.push(buffer);
            fileShare.transmitted += buffer.byteLength;
            console.log(fileShare.transmitted);
            if(fileShare.transmitted==fileShare.metadata.total_buffer_size){
                console.log("Receiver received the complete file");
                var getval=new Date;
                var hrs=getval.getHours();
                var mins=getval.getMinutes();
                var time=hrs + ":" + mins;
                // socket.emit("fs-rcomplete",
                // {
                //     sender:fileShare.sender,
                //     metadata:fileShare.metadata
                // }
                renderMessage("other",
                {
                    username: fileShare.metadata.usender,
                    text: fileShare.metadata.filename,
                    time: time
                });
                saveFile(new Blob(fileShare.buffer), fileShare.metadata.filename);
                fileShare={}
            }else{
                socket.emit("fs-start", {
                    sender:fileShare.sender
                })
            }
        });


        exitBtnRoom.addEventListener('click',function(){
            socket.emit('exituser',usn);
            window.location.href=window.location.href;
        });

        function saveFile(blob, filename) {
            if (window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(blob, filename);
            } else {
              const a = document.createElement('a');
              document.body.appendChild(a);
              const url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = filename;
              a.click();
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }, 0)
            }
          }

        function shareFile(metadata,buffer,progress_node){
            // if(type=="my"){
            //     //If type is mine, we will emit the file
            //     socket.emit("file-meta",{
            //     metadata:metadata
            //     });
            // }
            // else if(type=="other"){
            //     //do something
            // }
            // else if(type==update){
            //     //do something
            // }
            socket.emit("file-meta",{
                metadata:metadata
            });
            socket.on("fs-share-s",function(receiver){
                let chunk=buffer.slice(0,metadata.buffer_size);
                buffer=buffer.slice(metadata.buffer_size,buffer.length);
                progress_node.innerText=Math.trunc((metadata.total_buffer_size-buffer.length)/(metadata.total_buffer_size*100)+"%");
                if(chunk.length!=0){
                    socket.emit("file-raw",{
                        receiver:receiver.receiverid,
                        buffer:chunk
                    });
                }
            });
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