import { IncomingMessage } from 'http'
import { Readable } from 'stream'
import { Headers } from './request'

export class Response {
	private _msg: IncomingMessage
	constructor(msg: IncomingMessage) {
		this._msg = msg
	}
	header(): Headers
	header(name: string): string | string[] | undefined
	header(name?: string): Headers | string | string[] | undefined {
		if (typeof name === 'undefined') return this._msg.headers
		else return this._msg.headers[name.toLowerCase()]
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
