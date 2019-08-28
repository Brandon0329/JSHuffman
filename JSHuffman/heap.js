class Heap {
	constructor(comparator) {
		this.heap = [null];
		this.comparator = typeof comparator === 'function' ? comparator : (a, b) => a < b;
	}

	poll() {
		if(this.isEmpty())
			throw new Error('Heap is empty. Illegal operation.');
		if(this.heap.length - 1 == 1)
			return this.heap.pop();
		const ans = this.heap[1];
		this.heap[1] = this.heap.pop();
		let index = 1;
		while(index * 2 < this.heap.length) {
			let nextIndex = index * 2;
			if(index * 2 + 1 < this.heap.length)
				nextIndex = this.comparator(this.heap[index * 2], this.heap[index * 2 + 1]) ? index * 2 : index * 2 + 1;
			if(this.comparator(this.heap[index], this.heap[nextIndex]))
				break;
			this.swap(index, nextIndex);
			index = nextIndex;
		}
		return ans;
	}

	offer(val) {
		this.heap.push(val);
		let index = this.heap.length - 1;
		while(index != 1 && this.comparator(this.heap[index], this.heap[Math.floor(index / 2)])) {
			this.swap(index, Math.floor(index / 2));
			index = Math.floor(index / 2);
		}
		return this;
	}

	peek() {
		if(this.isEmpty())
			throw new Error('Heap is empty. Illegal operation');
		return this.heap[1];
	}

	size() {
		return this.heap.length - 1;
	}

	isEmpty() {
		return this.heap.length <= 1;
	}

	swap(a, b) {
		const temp = this.heap[a];
		this.heap[a] = this.heap[b];
		this.heap[b] = temp;
	}

	toString() {
		return this.heap;
	}
}

module.exports = Heap;

// // A lil test
// const heap = new Heap((a, b) => a > b);
// for(let i = 0; i < 10; i++) {
//  	let str = '';
//  	for(let j = 0; j < 6; j++)
//  		str += String.fromCodePoint(Math.floor(Math.random() * 26) + 'a'.codePointAt(0));
//  	heap.offer(str);
//  }
//  console.log(heap.toString());

//  for(let i = 0; i < 10; i++)
//  	console.log(heap.poll());
//  console.log(heap.toString());