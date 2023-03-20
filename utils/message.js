// const { mode } = require('crypto-js')
// const moment=require('moment')

// export function renderMessage(type,message){
//     if (type=="my"){
//         const div=document.createElement('div');
//         div.classList.add('my-message', 'message');
//         div.innerHTML= `<div><div class="name">${message.usn} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
//         document.querySelector('.messages').appendChild(div);
//     } else if (type=="other"){
//         const div=document.createElement('div');
//         div.classList.add('other-message', 'message');
//         div.innerHTML= `<div><div class="name">${message.usn} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
//         document.querySelector('.messages').appendChild(div);

//     } else if(type=="update"){
//         const div=document.createElement('div');
//         div.classList.add('update');
//         div.innerText=message;
//         // div.innerHTML= `<div><div class="name">${message.usrname} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
//         document.querySelector('.messages').appendChild(div);
//     }
// }
