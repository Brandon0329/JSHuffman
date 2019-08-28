// Make asynch
const fs = require('fs');

const BUF_SIZE = 512;

class BitReader {
	constructor(file) {
		this.fd = fs.openSync(file, 'r', 0o666);
		this.buf = Buffer.alloc(BUF_SIZE);
		fs.readSync(this.fd, this.buf, 0, BUF_SIZE, null);
		this.bufIndex = 0;
		this.curByte = this.buf[this.bufIndex];
		this.offset = 0;
	}

	readOne() {
		if(this.offset >= 8)
			this.nextByte();
		let bit = this.curByte & 1;
		this.curByte >>= 1;
		this.offset++;
		return bit;
	}

	read(bytes) {
		let val = 0;
		let pos = 0;
		let numBits = bytes * 8;
		while(pos < numBits) {
			val |= this.readOne() << pos;
			pos++;
		}
		return val;
	}

	nextByte() {
		this.bufIndex++;
		if(this.bufIndex >= BUF_SIZE) {
			this.buf.fill(0);
			fs.readSync(this.fd, this.buf, 0, BUF_SIZE, null);
			this.bufIndex = 0;
		}
		this.curByte = this.buf[this.bufIndex];
		this.offset = 0;
	}

	end() {
		fs.closeSync(this.fd);
	}
}

module.exports = BitReader;