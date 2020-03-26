import { Headers } from '../src/request'
import { Response } from '../src/response'
import { Readable } from 'stream'
import { IncomingMessage } from 'http'
import { stream2buffer } from './utils'

const makeIncomingMessage = (
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

test('Read text body', async () => {
	const msg = makeIncomingMessage('hello')
	const resp = new Response(msg)
	expect(await resp.text()).toBe('hello')
})
test('Read buffer body', async () => {
	const msg = makeIncomingMessage('hello')
	const resp = new Response(msg)
	expect(Buffer.from('hello').equals(await resp.buffer())).toBe(true)
})
test('Read json body', async () => {
	const data = { foo: 'bar' }
	const msg = makeIncomingMessage(JSON.stringify(data))
	const resp = new Response(msg)
	expect(await resp.json()).toStrictEqual(data)
})
test('Read stream body', async () => {
	const msg = makeIncomingMessage('hello')
	const resp = new Response(msg)
	const buf = await stream2buffer(resp.stream())
	expect(buf.toString()).toBe('hello')
})
test('Read headers', async () => {
	const testJson = JSON.stringify({ foo: 'bar' })
	const headers = {
		'content-type': 'application/json',
		'content-size': testJson.length.toString()
	}
	const msg = makeIncomingMessage(testJson, headers)
	const resp = new Response(msg)
	expect(resp.header()).toStrictEqual(headers)
	expect(resp.header('Content-Type')).toBe(headers['content-type'])
	expect(resp.header('content-size')).toBe(headers['content-size'])
})
