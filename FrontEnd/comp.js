const zlib = require('zlib');

function compressString(string){
    //const compressedString = zlib.gzipSync(string).toString('base64');
    //console.log("Before deflate hi");
    const compressedString = zlib.deflateSync(string).toString('base64');
    //console.log("After deflate hi");
    //console.log(`Uncompressed string: ${uncompressedString}`);
    console.log(`Compressed string: ${compressedString}`);
    return compressedString;
}

function decompressString(string){
    //console.log("Compressed string: "+string);
    const uncompressedString = zlib.inflateSync(Buffer.from(string, 'base64'));
    //const uncompressedString = zlib.gunzipSync(Buffer.from(string, 'base64')).toString();
    console.log(`Uncompressed string: ${uncompressedString}`);
    return uncompressedString;
    //console.log(`Uncompressed string: ${uncompressedString}`);
}

module.exports = { compressString, decompressString };
