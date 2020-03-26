import { Readable } from 'stream'

export const stream2buffer = (stream: Readable): Promise<Buffer> =>
	new Promise(resolve => {
		let arr: Buffer[] = []
		stream.on('data', chunk => arr.push(chunk))
		stream.on('end', () => resolve(Buffer.concat(arr)))
	})
