import request = require('../src/index')
import start, { Mock } from './fake-server'
import { stream2buffer } from './utils'

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
		res.end()
		return {
			body: await stream2buffer(req),
			headers: req.headers
		}
	})
	const [_, r] = await Promise.all([req.send(), wait])
	expect(JSON.parse(r.body.toString())).toStrictEqual(data)
	expect(r.headers['content-type']).toBe('application/json; charset=utf-8')
})
afterAll(() => {
	mock.server.close()
})
