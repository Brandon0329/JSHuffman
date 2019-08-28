// Make async
// First of all, make it faster
const fs = require('fs');

// class BitWriter {
// 	constructor(file) {
// 		this.file = file;
// 		this.buf = Buffer.alloc(1);
// 		this.offset = 0;
// 	}

// 	writeOne(val) {
// 		if(this.offset === 8)
// 			this.flush();
// 		if(val)
// 			this.buf[0] |= 1 << this.offset;
// 		this.offset++;
// 	}

// 	write(bytes, val) {
// 		if(typeof val === 'string')
// 			val = val.codePointAt(0);
// 		let numBits = bytes * 8;
// 		while(numBits != 0) {
// 			this.writeOne(val & 1);
// 			val >>= 1;
// 			numBits--;
// 		}
// 	}

// 	writeBitString(bitString) {
// 		for(let ch of bitString)
// 			if(ch === '1')
// 				this.writeOne(1);
// 			else
// 				this.writeOne(0);
// 	}

// 	flush() {
// 		fs.appendFileSync(this.file, this.buf);
// 		this.buf.fill(0);
// 		this.offset = 0;
// 	}

// 	end() {
// 		if(this.offset > 0)
// 			this.flush();
// 		this.file = undefined;
// 		this.buf = null;
// 	}
// }

// module.exports = BitWriter;

// MIGHT BE PROBLEMS WITH SETTIMEOUT AND CLEARTIMEOUT

const BUF_SIZE = 1 << 23;

class BitWriter {
	constructor(file) {
		this.fd = fs.openSync(file, 'w', 0o666);
		this.buf = Buffer.alloc(BUF_SIZE);
		this.bufPos = 0;
		this.bytePos = 0;
		this.bitsWritten = 0;
		this.filePos = 0;
		this.drainDelay = null;
		this.drained = true;
	}

	writeOne(bit) {
		if(this.drainDelay != null)
			clearTimeout(this.drainDelay);
		if(this.bytePos === 8) {
			this.bytePos = 0;
			this.bufPos++;
		}
		if(this.bufPos === BUF_SIZE)
			this.drain();
		if(this.drained === true)
			this.drained = false;
		if(bit)
			this.buf[this.bufPos] |= 1 << this.bytePos;
		this.bytePos++;
		this.bitsWritten++;
		this.drainDelay = setTimeout(this.drain, 400);
	}

	write(bytes, val) {
		if(typeof val === 'string')
			val = val.codePointAt(0);
		let numBits = bytes * 8;
		while(numBits > 0) {
			this.writeOne(val & 1);
			val >>= 1;
			numBits--;
		}
	}

	writeBitString(bitString) {
		for(let ch of bitString)
			if(ch === '1')
				this.writeOne(1);
			else
				this.writeOne(0);
	}

	drain() {
		const bits = this.bitsWritten;
		const length = bits % 8 == 0 ? Math.floor(bits / 8) : Math.floor(bits / 8) + 1;
		const fd = this.fd;
		this.filePos += fs.writeSync(fd, this.buf, 0, length, this.filePos);
		if(bits % 8 != 0)
			this.filePos--;
		if(this.bufPos >= BUF_SIZE || this.bytePos % 8 == 0) {
			this.bufPos = 0;
			this.bytePos = 0;
			this.bitsWritten = 0;
		} else {
			let curByte = this.buf[this.bufPos];
			this.buf[0] = 0;
			for(let i = 0; i < this.bytePos; i++) {
				this.buf[0] |= (curByte & 1) << i;
				curByte >>= 1;
			}
			this.bufPos = 0;
			this.bitsWritten = bits % 8;
		}
	}

	end() {
		if(this.drainDelay != null)
			clearTimeout(this.drainDelay);
		if(!this.drained)
			this.drain();
		fs.closeSync(this.fd);
		this.buf = null;
	}
}

module.exports = BitWriter;