const fs = require('fs');
const bw = require('./bitwriter');
const Heap = require('./heap');

const MAGIC_NO = 0x66667568;
const PEOF = 256;

const HuffmanTreeNode = function(left, val, freq, right) {
	this.left = left;
	this.val = val;
	this.freq = freq;
	this.right = right;

	this.isLeaf = () => !this.left && !this.right;
};

const getFrequenciesSync = function(file) {
	const data = fs.readFileSync(file);
	let freq = {};
	for(let ch of data) {
		if(freq[ch] === undefined)
			freq[ch] = 0;
		freq[ch]++;
	}
	return freq;
}

const getFrequencies = function(file) {
	let freq = {};
	return new Promise((resolve, reject) => {
		const stream = fs.createReadStream(file);
		stream.on('data', chunk => {
			for(let ch of chunk) {
				if(freq[ch] === undefined)
					freq[ch] = 0;
				freq[ch]++;
			}
		});
		stream.on('end', () => {
			resolve(freq);
		});
		stream.on('error', err => {
			reject(err);
		});
	});
};

const createTree = function(freq) {
	const heap = new Heap((a, b) => a.freq < b.freq);
	for(let [key, value] of Object.entries(freq)) 
		heap.offer(new HuffmanTreeNode(null, key, value, null));
	// Add pseudo EOF
	heap.offer(new HuffmanTreeNode(null, PEOF, 1, null));
	while(heap.size() > 1) {
		let left = heap.poll();
		let right = heap.poll();
		heap.offer(new HuffmanTreeNode(left, null, left.freq + right.freq, right));
	}
	return heap.poll();
};

const getEncodings = function(root) {
	let encodings = {};
	getEncodingsHelper(root, encodings, []);
	return encodings;
}

const getEncodingsHelper = function(root, encodings, stringSoFar) {
	if(!root)
		return;
	if(root.isLeaf())
		encodings[root.val] = stringSoFar.join('');
	else {
		stringSoFar.push('0');
		getEncodingsHelper(root.left, encodings, stringSoFar);
		stringSoFar.pop();
		stringSoFar.push('1');
		getEncodingsHelper(root.right, encodings, stringSoFar);
		stringSoFar.pop();
	}
};

const writeHeader = function(bitWriter, encodings) {
	bitWriter.write(4, MAGIC_NO);
	bitWriter.write(4, Object.keys(encodings).length);
	for(let [key, value] of Object.entries(encodings)) {
		bitWriter.write(1, key);
		bitWriter.writeBitString(value);
	}
};

const compressSync = function(bitWriter, encodings, file) {
	const data = fs.readFileSync(file);
	for(let ch of data)
		bitWriter.writeBitString(encodings[ch]);
	bitWriter.writeBitString(encodings[PEOF]);
	bitWriter.end();
}

const compress = function(bitWriter, encodings, file) {
	return new Promise((resolve, reject) => {
		const stream = fs.createReadStream(file);
		stream.on('data', chunk => {
			for(let ch of chunk)
				bitWriter.writeBitString(encodings[ch]);
		});
		stream.on('end', () => {
			bitWriter.writeBitString(encodings[PEOF]);
			resolve();
		});
		stream.on('error', (err) => {
			reject(err);
		});
	});
};

const runCompression = async function() {
	// Eventually, want to take a list of files/directories and gather frequencies for all.
	const newFile = `${process.argv[2]}.hf`;
	const file = `./${process.argv[3]}`; // All files/directories to be compressed
	const time = process.argv[4] === '--time';
	const encodings = getEncodings(createTree(await getFrequencies(file)));
	// Debugging
	console.log(encodings);
	
	let start;

	const bitWriter = new bw(newFile);
	console.log('here first');
	if(time)
		start = new Date();
	writeHeader(bitWriter, encodings);
	console.log('here');
	await compress(bitWriter, encodings, file);
	if(time)
		console.log(new Date() - start);
	bitWriter.end();
	console.log('here last');
}

// Run compression
runCompression();