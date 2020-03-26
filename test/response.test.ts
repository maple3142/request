import { Response } from '../src/response'
import { makeIncomingMessage, stream2buffer } from './utils'

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
test('Read json with encoding body', async () => {
	const data = { foo: 'bar' }
	const json = JSON.stringify(data)
	const encodedJson = Buffer.from(json).toString('latin1')
	const msg = makeIncomingMessage(encodedJson)
	const resp = new Response(msg)
	expect(await resp.json('latin1')).toStrictEqual(data)
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
