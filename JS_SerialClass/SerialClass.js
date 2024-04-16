class serial {
	#updconn(event) {
		console.log(event);
	}
	#buffer = "";
	
	#readloop() {
		//Wait for new data and put it into our buffer
		this.Reader.read().then((value)=>{
			//Convert the Data of value.value to a readable String
			//  This is done by looping over each Element of value.value as id2 and converting the number to a char aswell as putting it into id3 as String
			let id3 = "";
			value.value.forEach((id2)=>{
				id3 += String.fromCharCode(id2);
			});
			//ConsoleLogging of id3                     //Yeah
			//console.log(id3);
			//Put it into the buffer with
			this.#buffer += id3;
			//Recall this function
			this.datalenght = this.#buffer.length;
			this.#readloop();
		}).catch((err)=>{console.warn("Error: "+err)});
	}
	constructor(baudrate=9600) {
		if (!(navigator.serial == undefined)) {
			navigator.serial.requestPort().then((Lport)=>{
				this.port = Lport;
				this.baudrate = baudrate;
				this.opened = false;
				this.Reader = null;
				this.Writer = null;
				this.port.onconnect = this.#updconn;
				this.port.ondisconnect = this.#updconn;
			}).catch((err)=>{console.warn(err);});
		} else {
			throw "Your Browser doesn't support the serial API";
		}
	}
	open() {
		if (!this.opened) {
			let SerialCfg = {};
			SerialCfg["baudRate"] = this.baudrate;
			this.port.open(SerialCfg).then(()=>{
				this.Reader = this.port.readable.getReader();
				this.Writer = this.port.writable.getWriter();
				this.opened = true;
				this.#readloop();
			}).catch((err)=>{console.warn(err);});
		} else {
			this.close();
			setTimeout(()=>{
				this.open();
			},100);
		}
	}
	close() {
		if (this.opened) {
			this.Reader.cancel();
			this.Reader.releaseLock();
			this.Writer.abort();
			this.Writer.releaseLock();
			this.port.close();
			this.opened = false;
		}
	}
	read(all=false) {
		if (!all) {
			let id1 = this.#buffer.split('\r\n');
			let res = id1[0];
			let id2 = "";
			let id3 = id1.slice(1);
			id3.forEach((id4)=>{
				if (!(id4 = "")) {
					id2 += (id4 + "\r\n");
				}
			});
			this.#buffer = id2;
			return res;
		} else {
			let res = this.#buffer;
			this.#buffer = '';
			return res;
		}
	}
	write(data) {
		if (typeof data == 'string') {
			let id1=[];
			for (let id2 = 0; id2 < data.length; id2++) {
				id1[id2] = data.charCodeAt(id2);
			}
			id1[data.length+1]=10;
			let id3 = new Uint8Array(id1);
			this.Writer.write(id3);
		} else if ((typeof data == 'object') && (data instanceof Uint8Array)) {
			this.Writer.write(data);
		} else {
			console.warn("data isn't of type Uint8Array or String");
		}
	}
	
	datalenght = this.#buffer.length;
}