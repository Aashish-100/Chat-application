var prompt = require('prompt-sync')();
//npm install prompt-sync

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
	for (i = 0; i < 3; i++)
	{
		for (j = 0; j < 1; j++)
		{
			cipherMatrix[i][j] = 0;
		
			for (x = 0; x < 3; x++)
			{
				cipherMatrix[i][j] += keyMatrix[i][x] * messageVector[x][j];
			}
		
			//cipherMatrix[i][j] = cipherMatrix[i][j] % 26;
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
				resultVector[i][j] += invMatrix[i][x] * cipherMatrix[x][j];
                resultVector[i][j] = Math.round(resultVector[i][j]);
			}
		
			//cipherMatrix[i][j] = cipherMatrix[i][j] % 26;
		}
	}
}

var invmatrix = Array(3);
    for(i=0;i<3;i++)
        invmatrix[i] = Array(3).fill(0);

// Function to implement Hill Cipher
function HillCipher(message, key)
{
	// Get key matrix from the key string
	let keyMatrix = new Array(3);
	for(let i=0;i<3;i++)
	{
		keyMatrix[i]=new Array(3);
		for(let j=0;j<3;j++)
			keyMatrix[i][j]=0;
	}
	getKeyMatrix(key, keyMatrix);
    checkInvertibility(keyMatrix);
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
        }
    }
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

	//let CipherText="";

	// Generate the encrypted text from
	// the encrypted vector
	// for (let i = 0; i < 3; i++)
	// 	CipherText += String.fromCharCode(cipherMatrix[i][0] + 65);

	// // Finally print the ciphertext
	// document.write(" Ciphertext: " + CipherText);
}

// Get the message to be encrypted
let message = "Aatmanirbhar Sanchar";
//et message = "Aatmanirbhar Sanchar"

// Get the key
let key = "GYBNQKURP";
const msglen = message.length;
var blocks = msglen/3;
blocks=Math.ceil(blocks);
let FinalText = "";

for(i=0;i<blocks;i++)
{
    var msgblock = message.slice(i*3,i*3+3);
    HillCipher(msgblock, key);
}

console.log("Final text: "+FinalText);

function checkInvertibility(matrix)
{
    function transpose(A , B) {
        var i, j;
        for (i = 0; i < 3; i++)
            for (j = 0; j < 3; j++)
                B[i][j] = A[j][i];
    }


    // var matrix= new Array(3);
    // for (var i = 0; i < matrix.length; i++) {
    //     matrix[i] = [];
    // }
    // for(var i=0; i<3; i++)
    // {
    //     for(var j=0;j<3;j++)
    //     {
    //         matrix[i][j]=prompt("element "+i+""+j+" ");
    //     }
    // }
    // for(var i=0; i<3; i++)
    // {
    //     for(var j=0;j<3;j++)
    //     {
    //         console.log(matrix[i][j]);
    //     }
    // }

    //calculating determinant of matrix
    var d1 = matrix[1][1]*matrix[2][2]-matrix[1][2]*matrix[2][1];
    var d2 = matrix[1][0]*matrix[2][2]-matrix[1][2]*matrix[2][0];
    var d3 = matrix[1][0]*matrix[2][1]-matrix[1][1]*matrix[2][0];
    var a = matrix[0][0];
    var b = matrix[0][1];
    var c = matrix[0][2];
    var det = a*d1 - b*d2 + c*d3;

    if(det!=0)
    {
        var tmatrix = Array(3);

        for(i=0;i<3;i++)
            tmatrix[i] = Array(3).fill(0);

        transpose(matrix, tmatrix);

        for(var i=0; i<3; i++)
        {
            for(var j=0;j<3;j++)
            {
                console.log(tmatrix[i][j]);
            }
        }
        console.log("Determinant "+det);

        var det9 = tmatrix[0][0]*tmatrix[1][1]-tmatrix[0][1]*tmatrix[1][0];
        var det7 = tmatrix[0][1]*tmatrix[1][2]-tmatrix[0][2]*tmatrix[1][1];
        var det8 = tmatrix[0][0]*tmatrix[1][2]-tmatrix[0][2]*tmatrix[1][0];
        var det3 = tmatrix[1][0]*tmatrix[2][1]-tmatrix[1][1]*tmatrix[2][0];
        var det1 = tmatrix[1][1]*tmatrix[2][2]-tmatrix[1][2]*tmatrix[2][1];
        var det2 = tmatrix[1][0]*tmatrix[2][2]-tmatrix[1][2]*tmatrix[2][0];
        var det6 = tmatrix[0][0]*tmatrix[2][1]-tmatrix[0][1]*tmatrix[2][0];
        var det4 = tmatrix[0][1]*tmatrix[2][2]-tmatrix[0][2]*tmatrix[2][1];
        var det5 = tmatrix[0][0]*tmatrix[2][2]-tmatrix[0][2]*tmatrix[2][0];

        var adj = Array(3);
        for(i=0;i<3;i++)
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

        for(i=0; i<3; i++)
        {
            for(j=0;j<3;j++)
            {
                console.log(adj[i][j]);
            }
        }


        for(i=0; i<3; i++)
        {
            for(j=0;j<3;j++)
            {
                invmatrix[i][j]=adj[i][j]/Math.abs(det);
            }
        }
        for(i=0; i<3; i++)
        {
            for(j=0;j<3;j++)
            {
                console.log(invmatrix[i][j]);
            }
        }
    }

}
