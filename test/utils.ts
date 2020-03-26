import { Readable } from 'stream'
import { Headers } from '../src/request'
import { IncomingMessage } from 'http'

export const stream2buffer = (stream: Readable): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		let arr: Buffer[] = []
		stream
			.on('data', chunk => arr.push(chunk))
			.on('end', () => resolve(Buffer.concat(arr)))
			.on('error', err => reject(err))
	})

export const makeIncomingMessage = (
	body: string | Buffer | Readable,
	headers: Headers = {}
): IncomingMessage => {
	let msg: any
	if (typeof body === 'string' || Buffer.isBuffer(body)) {
		msg = new Readable({
			read(size) {
				this.push(body)
				this.push(null)
			}
		})
	} else {
		msg = body
	}
	msg.headers = headers
	return msg
}
