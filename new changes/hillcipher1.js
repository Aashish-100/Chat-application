// Javascript code to implement Hill Cipher

// Following function generates the
// key matrix for the key string
function getKeyMatrix(key,keyMatrix)
{
    let k = 0;
    for (let i = 0; i < 3; i++)
    {
        for (let j = 0; j < 3; j++)
        {
            keyMatrix[i][j] = (key[k]).charCodeAt(0);
            k++;
        }
    }
}

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
        }
    }
}

var ciphertext = "";
var FinalText = "";
var invmatrix = Array(3);
    for(let i=0;i<3;i++)
        invmatrix[i] = Array(3).fill(0);

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
    for (let i = 0; i < 3; i++)
    {
        if(message[i]==undefined)
        messageVector[i][0] = ('\0').charCodeAt(0);
        else
        messageVector[i][0] = (message[i]).charCodeAt(0);
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
    console.log("Cipher Matrix: ");
    for(var i=0; i<3; i++)
    {
        for(var j=0;j<1;j++)
        {
            console.log(cipherMatrix[i][j]);
            ciphertext+=cipherMatrix[i][j].toString().padStart(11,'0');
        }
    }

}

function DecryptedText(cipherMatrix)
{

    let resultVector = new Array(3);
    for(let i=0;i<3;i++)
    {
        resultVector[i]=new Array(1);
        resultVector[i][0]=0;
    }

    decrypt(cipherMatrix, invmatrix, resultVector);
    console.log("Result Matrix: ");
    for(var i=0; i<3; i++)
    {
        for(var j=0;j<1;j++)
        {
            console.log(resultVector[i][j]);
        }
    }

    let FinalBlockText = "";
    for(i=0; i<3; i++)
    {
        for(j=0; j<1; j++)
        {
            FinalBlockText+=String.fromCharCode(resultVector[i][j]);
        }
    }
    FinalText+=FinalBlockText;
}

var blocks;
var keyMatrix;
function HillCipherE(message, key)
{

    const msglen = message.length;
    blocks = msglen/3;
    blocks=Math.ceil(blocks);
    //console.log("Blocks: "+blocks);
    //let FinalText = "";
    keyMatrix = new Array(3);
    for(let i=0;i<3;i++)
    {
        keyMatrix[i]=new Array(3);
        for(let j=0;j<3;j++)
            keyMatrix[i][j]=0;
    }
    var invertible = false;
    var start=0;
    while((!invertible)&&((start+9)<=(key.length)))
    {
        var counter = 0;
        var hckey = key.slice(start,start+9);
        console.log("Key selected: "+hckey);
        getKeyMatrix(hckey, keyMatrix);
        invertible = checkInvertibility(keyMatrix,counter);
        start++;
    }
    if(!invertible)
    {
        hckey="GYBNQKURP";
        getKeyMatrix(hckey, keyMatrix);
    }
    inverse(keyMatrix); //calculate the inverse

    for(let i=0;i<blocks;i++)
    {
        var msgblock = message.slice(i*3,i*3+3);
        console.log("Message block "+msgblock);
        CipherGeneration(msgblock, keyMatrix);
    }
    //console.log("Cipher: "+ciphertext);
    return ciphertext;
}
function HillCipherD(cipher)
{
    let ind=0;
    let cipherMatrix = new Array(3);
    for(let i=0;i<3;i++)
    {
        cipherMatrix[i]=new Array(1);
        cipherMatrix[i][0]=0;
    }
    let count = 0;
    while(ind+11<=cipher.length)
    {
        let s = cipher.slice(ind,ind+11);
        s = Number(s);
        if(count<3)
        {
            cipherMatrix[count][0]=s;
            if(count==2)
            {
                DecryptedText(cipherMatrix);
                count=-1;
            }
        }
        count++;
        ind+=11;

    }
    // for(let i=0;i<blocks;i++)
    // {
    //     var cblock = cipher.slice(i*3,i*3+3);
    //     //console.log(msgblock);
    //     DecryptedText(cblock);
    // }
    
    //console.log("Final text: "+FinalText);
    return FinalText;
}
var det;
var inv=false;
function checkInvertibility(matrix,counter)
{
    //calculating determinant of matrix
    var d1 = matrix[1][1]*matrix[2][2]-matrix[1][2]*matrix[2][1];
    var d2 = matrix[1][0]*matrix[2][2]-matrix[1][2]*matrix[2][0];
    var d3 = matrix[1][0]*matrix[2][1]-matrix[1][1]*matrix[2][0];
    var a = matrix[0][0];
    var b = matrix[0][1];
    var c = matrix[0][2];
    det = a*d1 - b*d2 + c*d3;
    
    if(det!=0)
    {
        keyMatrix = matrix;
        return true;
    }else{
        if(counter<1)
        {
            matrix[2][2]+=1;
            console.log("Last element changed")
            //keyMatrix[2][2]+=1;
            counter+=1;
            inv = checkInvertibility(matrix,counter);
            return inv;
        }
        else
            return false;
    }

}

function inverse(matrix)
{
    function transpose(A , B) {
        var i, j;
        for (i = 0; i < 3; i++)
            for (j = 0; j < 3; j++)
                B[i][j] = A[j][i];
    }

    var tmatrix = Array(3);

    for(let i=0;i<3;i++)
        tmatrix[i] = Array(3).fill(0);

    transpose(matrix, tmatrix);

    var det9 = tmatrix[0][0]*tmatrix[1][1]-tmatrix[0][1]*tmatrix[1][0];
    var det7 = tmatrix[0][1]*tmatrix[1][2]-tmatrix[0][2]*tmatrix[1][1];
    var det8 = tmatrix[0][0]*tmatrix[1][2]-tmatrix[0][2]*tmatrix[1][0];
    var det3 = tmatrix[1][0]*tmatrix[2][1]-tmatrix[1][1]*tmatrix[2][0];
    var det1 = tmatrix[1][1]*tmatrix[2][2]-tmatrix[1][2]*tmatrix[2][1];
    var det2 = tmatrix[1][0]*tmatrix[2][2]-tmatrix[1][2]*tmatrix[2][0];
    var det6 = tmatrix[0][0]*tmatrix[2][1]-tmatrix[0][1]*tmatrix[2][0];
    var det4 = tmatrix[0][1]*tmatrix[2][2]-tmatrix[0][2]*tmatrix[2][1];
    var det5 = tmatrix[0][0]*tmatrix[2][2]-tmatrix[0][2]*tmatrix[2][0];

    var adj = Array(3); //adjoint matrix
    for(let i=0;i<3;i++)
        adj[i] = Array(3).fill(0);

    adj[0][0]=det1;
    adj[0][1]=-det2;
    adj[0][2]=det3;
    adj[1][0]=-det4;
    adj[1][1]=det5;
    adj[1][2]=-det6;
    adj[2][0]=det7;
    adj[2][1]=-det8;
    adj[2][2]=det9;

    for(let i=0; i<3; i++)
    {
        for(let j=0;j<3;j++)
        {
            invmatrix[i][j]=adj[i][j]/Math.abs(det);
        }
    }
    console.log("Inverse matrix:");
    for(let i=0; i<3; i++)
    {
        for(let j=0;j<3;j++)
        {
            console.log(invmatrix[i][j]);
        }
    }
}

var generatedCipherText = HillCipherE("A","abbbbbbbbcbbbarilyMunchkinUcoiledPayday_");
console.log("Cipher Text: "+generatedCipherText);
var generatedFinalText = HillCipherD(generatedCipherText);
console.log("Final Text: "+generatedFinalText);
// 😀