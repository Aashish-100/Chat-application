const zlib = require('zlib');

function compressString(string){
    const compressedString = zlib.gzipSync(string).toString('base64');
    //const compressedString = zlib.deflateSync(string).toString('base64');
    //console.log(`Uncompressed string: ${uncompressedString}`);
    console.log(`Compressed string: ${compressedString}`);
    return compressedString;
}

function decompressString(string){
    console.log("Compressed string: "+string);
    //const uncompressedString = zlib.inflateSync(Buffer.from(string, 'base64')).toString();
    const uncompressedString = zlib.gunzipSync(Buffer.from(string, 'base64')).toString();
    return uncompressedString;
    //console.log(`Uncompressed string: ${uncompressedString}`);
}

module.exports = { compressString, decompressString };
