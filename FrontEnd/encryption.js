// import CryptoJS from 'crypto-js';


//const CryptoJS = require('crypto-js');
//https://www.npmjs.com/package/crypto-js




const crypt = (function () {
    // Encrypts and decrypts data using CryptoJS in password mode.


    return {
        encryptMessage: function (messageToencrypt = '', secretkey = '', keyMatrix) {
            var encryptedMessage = HillCipherE(messageToencrypt, keyMatrix);
            ciphertext = "";
            console.log("After hill cipher encryption");
            console.log(encryptedMessage);
            encryptedMessage = CryptoJS.AES.encrypt(encryptedMessage, secretkey);
            //var encryptedMessage = CryptoJS.AES.encrypt(messageToencrypt, secretkey);
            return encryptedMessage.toString();
        },
        decryptMessage: function (encryptedMessage = '', secretkey = '', invMatrix) {
            try {
                var decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, secretkey);
                var decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
                //console.log("After AES decryption: "+decryptedMessage);
                decryptedMessage = HillCipherD(decryptedMessage,invMatrix);
                console.log("Final message(Data url received)");
                console.log(decryptedMessage);
               
                FinalText = "";
                return decryptedMessage;
            } catch (err) {
                console.log("Malformed UTF-8 Data.")
                return '';
            }
        }
    };
})();
module.exports = {crypt};
// Javascript code to implement Hill Cipher


// Following function generates the
// key matrix for the key string
// function getKeyMatrix(key,keyMatrix)
// {
//     let k = 0;
//     for (let i = 0; i < 3; i++)
//     {
//         for (let j = 0; j < 3; j++)
//         {
//             keyMatrix[i][j] = (key[k]).charCodeAt(0);
//             k++;
//         }
//     }
// }


// Following function encrypts the message
function encrypt(cipherMatrix,keyMatrix,messageVector)
{
    let x, i, j;
    for(i = 0; i < 3; i++)
    {
        for(j = 0; j < 1; j++)
        {
            cipherMatrix[i][j] = 0;


            for(x = 0; x < 3; x++)
            {
            cipherMatrix[i][j] += keyMatrix[i][x] * messageVector[x][j];
            }


        }
    }
}


function decrypt(cipherMatrix,invMatrix,resultVector)
{
    let x, i, j;
    for (i = 0; i < 3; i++)
    {
        for (j = 0; j < 1; j++)
        {
            resultVector[i][j] = 0;


            for (x = 0; x < 3; x++)
            {
                resultVector[i][j] += (invMatrix[i][x] * cipherMatrix[x][j]);
            }
            resultVector[i][j]=Math.abs(Math.round(resultVector[i][j]));
            //console.log("Result from decrypt function: "+resultVector[i][j]);
        }
    }
}


var ciphertext = "";
var FinalText = "";
// var invmatrix = Array(3);
//     for(let i=0;i<3;i++)
//         invmatrix[i] = Array(3).fill(0);


// Function to implement Hill Cipher
function CipherGeneration(message, keyMatrix)
{


    //****************************
    //optimize this *keymatrix is being calculated everytime though the key is same*
    //****************************


    let messageVector = new Array(3);
    for(let i=0;i<3;i++)
    {
        messageVector[i]=new Array(1);
        messageVector[i][0]=0;
    }
   


    // Generate vector for the message
    //console.log("Message Vector: ");
    for (let i = 0; i < 3; i++)
    {
        if(message[i]==undefined)
        messageVector[i][0] = ('\0').charCodeAt(0);
        else
        messageVector[i][0] = (message[i]).charCodeAt(0);
        //console.log(messageVector[i][0])
    }


    let cipherMatrix = new Array(3);
    for(let i=0;i<3;i++)
    {
    cipherMatrix[i]=new Array(1);
    cipherMatrix[i][0]=0;
    }


    // Following function generates
    // the encrypted vector
    encrypt(cipherMatrix, keyMatrix, messageVector);
    //console.log("Cipher Matrix: ");
    for(var i=0; i<3; i++)
    {
        for(var j=0;j<1;j++)
        {
            //console.log(cipherMatrix[i][j]);
            //ciphertext+=cipherMatrix[i][j].toString().padStart(11,'0');
            ciphertext+=cipherMatrix[i][j].toString()+"+";
        }
    }


}


function DecryptedText(cipherMatrix, invMatrix)
{


    let resultVector = new Array(3);
    for(let i=0;i<3;i++)
    {
        resultVector[i]=new Array(1);
        resultVector[i][0]=0;
    }


    //console.log("Inverse matrix:");
    // for(let i=0; i<3; i++)
    // {
    //     for(let j=0;j<3;j++)
    //     {
    //         //console.log(invMatrix[i][j]);
    //     }
    // }


    decrypt(cipherMatrix, invMatrix, resultVector);
    // console.log("Result Matrix: ");
    // for(var i=0; i<3; i++)
    // {
    //     for(var j=0;j<1;j++)
    //     {
    //         console.log(resultVector[i][j]);
    //     }
    // }


    let FinalBlockText = "";
    for(let i=0; i<3; i++)
    {
        for(let j=0; j<1; j++)
        {
            if(resultVector[i][j]==0)
                break;
            FinalBlockText+=String.fromCharCode(resultVector[i][j]);
        }
    }
    FinalText+=FinalBlockText;
    //console.log("Final text from DecryptedText: "+FinalText);
}


var blocks;
//var keyMatrix;
function HillCipherE(message, keyMatrix)
{


    const msglen = message.length;
    blocks = msglen/3;
    blocks=Math.ceil(blocks);
    //console.log("Blocks: "+blocks);
    //let FinalText = "";
    // keyMatrix = new Array(3);
    // for(let i=0;i<3;i++)
    // {
    //     keyMatrix[i]=new Array(3);
    //     for(let j=0;j<3;j++)
    //         keyMatrix[i][j]=0;
    // }
    // var invertible = false;
    // var start=0;
    // while((!invertible)&&((start+9)<=(key.length)))
    // {
    //     var counter = 0;
    //     var hckey = key.slice(start,start+9);
    //     console.log("Key selected: "+hckey);
    //     getKeyMatrix(hckey, keyMatrix);
    //     invertible = checkInvertibility(keyMatrix,counter);
    //     start++;
    // }
    // if(!invertible)
    // {
    //     hckey="GYBNQKURP";
    //     getKeyMatrix(hckey, keyMatrix);
    // }
    // inverse(keyMatrix); //calculate the inverse


    for(let i=0;i<blocks;i++)
    {
        var msgblock = message.slice(i*3,i*3+3);
        //console.log("Message block "+msgblock);
        CipherGeneration(msgblock, keyMatrix);
    }
    //console.log("Cipher: "+ciphertext);
    return ciphertext.slice(0,ciphertext.length-1);
}
function HillCipherD(cipher, invMatrix)
{
    // var invertible = false;
    // var start=0;
    // while((!invertible)&&((start+9)<=(key.length)))
    // {
    //     var counter = 0;
    //     var hckey = key.slice(start,start+9);
    //     console.log("Key selected: "+hckey);
    //     getKeyMatrix(hckey, keyMatrix);
    //     invertible = checkInvertibility(keyMatrix,counter);
    //     start++;
    // }
    // if(!invertible)
    // {
    //     hckey="GYBNQKURP";
    //     getKeyMatrix(hckey, keyMatrix);
    // }
    // inverse(keyMatrix);


    let ind=0;
    let cipherMatrix = new Array(3);
    for(let i=0;i<3;i++)
    {
        cipherMatrix[i]=new Array(1);
        cipherMatrix[i][0]=0;
    }
    let count = 0;
    //console.log("Cipher Matrix: ");


    const cipherArray = cipher.split("+");
    for(let i=0;i<cipherArray.length;i++)
    {
        let s = Number(cipherArray[i]);
        if(count<3)
        {
            cipherMatrix[count][0]=s;
            //console.log(cipherMatrix[count][0]);
            if(count==2)
            {
                DecryptedText(cipherMatrix, invMatrix);
                //console.log("Cipher Matrix: ");
                count=-1;
            }
        }
        count++;
    }




    // while(ind+11<=cipher.length)
    // {
    //     let s = cipher.slice(ind,ind+11);
    //     s = Number(s);
    //     if(count<3)
    //     {
    //         cipherMatrix[count][0]=s;
    //         //console.log(cipherMatrix[count][0]);
    //         if(count==2)
    //         {
    //             DecryptedText(cipherMatrix, invMatrix);
    //             //console.log("Cipher Matrix: ");
    //             count=-1;
    //         }
    //     }
    //     count++;
    //     ind+=11;


    // }
    // for(let i=0;i<blocks;i++)
    // {
    //     var cblock = cipher.slice(i*3,i*3+3);
    //     //console.log(msgblock);
    //     DecryptedText(cblock);
    // }
   
    //console.log("Final text: "+FinalText);
    return FinalText;
}
