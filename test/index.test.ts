import request = require('../src/index')
import start, { Mock } from './fake-server'
import { stream2buffer } from './utils'
import { createReadStream, readFile } from 'fs-extra'
import { Readable } from 'stream'

let mock: Mock

beforeAll(() =>
	start().then(m => {
		mock = m
	})
)
test('Send GET Request and read header and body', async () => {
	const req = request(mock.url + '/api/test')
	const wait = mock.waitFor('/api/test').then(([req, res]) => {
		res.end('response')
	})
	const [resp, _] = await Promise.all([req.send(), wait])
	expect(await resp.text()).toBe('response')
})
test('Send json POST Request', async () => {
	const data = { foo: 'bar' }
	const req = request(mock.url + '/api/post/json')
		.post()
		.json(data)
	const wait = mock.waitFor('/api/post/json').then(async ([req, res]) => {
		const body = await stream2buffer(req)
		res.end()
		return {
			body,
			headers: req.headers
		}
	})
	const [_, r] = await Promise.all([req.send(), wait])
	expect(JSON.parse(r.body.toString())).toStrictEqual(data)
	expect(r.headers['content-type']).toBe('application/json; charset=utf-8')
})
test('Send image PUT Request', async () => {
	const file = __dirname + '/pusheen.jpg'
	const req = request(mock.url + '/api/image/upload')
		.put()
		.body(createReadStream(file))
	const wait = mock.waitFor('/api/image/upload').then(async ([req, res]) => {
		const body = await stream2buffer(req) // don't read body res.end(), or it will have some odd behaviors...
		res.end('hi')
		return body
	})
	expect(await req.send().then(r => r.text())).toBe('hi')
	const body = await wait
	expect(body.equals(await readFile(file))).toBe(true)
})
afterAll(() => {
	mock.server.close()
})
