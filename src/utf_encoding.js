const myString = "Hello, world! 🌍";

// Encode the string into a Uint8Array of UTF-8 bytes
const encoder = new TextEncoder();
const utf8Bytes = encoder.encode(myString);

console.log("Original String:", myString);
console.log("UTF-8 Bytes:", utf8Bytes);

// To convert the bytes back to a string
const decoder = new TextDecoder('utf-8');
const decodedString = decoder.decode(utf8Bytes);
console.log("Decoded String:", decodedString);

/**
 * Original String: Hello, world! 🌍
UTF-8 Bytes: 72,101,108,108,111,44,32,119,111,114,108,100,33,32,240,159,140,141
Decoded String: Hello, world! 🌍
 */

