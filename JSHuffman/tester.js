const fs = require('fs');
const promisify = require('util').promisify;
const BitReader = require('./bitreader');
const BitWriter = require('./bitwriter');

const bw = new BitWriter('test1.txt');
for(let i = 0; i < 100; i++) {
	let val = Math.round(Math.random());
	console.log(val);
	bw.writeOne(val);
}
bw.end();
console.log();
const br = new BitReader('test1.txt');
for(let i = 0; i < 100; i++)
	console.log(br.readOne());
br.end();

// const openPromise = promisify(fs.open);
// const readPromise = promisify(fs.read);

// const br = new BitReader('test.txt');
// // async function openAndRead() {
// 	let buf = Buffer.alloc(14);
// 	let fd = await openPromise('test.txt', 'r', 0o666);
// 	let data = await readPromise(fd, buf, 0, 14, null);
// 	console.log(data.buffer);
// }

// openAndRead();
// let stream = fs.createReadStream('test.txt');
// stream.on('readable', () => {
// 	let buf = stream.read();
// 	console.log(buf);
// });
// const br = new BitReader('med1.txt');
// for(let i = 0; i < 2048; i++)
// 	console.log(String.fromCodePoint(br.read(1)));
// br.end();
// const BitWriter = require('./bitwriter');

// const bw = new BitWriter('test.txt');
// for(let i = 0; i < 10; i++) {
// 	let char = String.fromCodePoint(Math.floor(Math.random() * 26) + 'a'.codePointAt(0));
// 	console.log(char);
// 	bw.write(1, char);
// }
// bw.write(4, 256);
// bw.end();