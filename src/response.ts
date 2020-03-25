import { IncomingMessage } from 'http'
import { Readable } from 'stream'

export class Response {
	private _msg: IncomingMessage
	constructor(msg: IncomingMessage) {
		this._msg = msg
	}
	stream(): Readable {
		return this._msg
	}
	buffer(): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const buffers: Buffer[] = []
			this._msg.on('data', chunk => buffers.push(chunk))
			this._msg.on('end', () => {
				resolve(Buffer.concat(buffers))
			})
			this._msg.on('error', err => reject(err))
		})
	}
	text(encoding: string = 'utf-8'): Promise<string> {
		return this.buffer().then(buf => buf.toString(encoding))
	}
	json(encoding: string = 'utf-8') {
		return this.text(encoding).then(JSON.parse)
	}
}
