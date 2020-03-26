import { URL } from 'url'
import { Request } from '../src/request'
import { Readable } from 'stream'
import { stream2buffer } from './utils'

test('Set query', () => {
	const req = new Request('http://localhost/test').query({
		a: 1
	})
	expect(req.url().href).toBe('http://localhost/test?a=1')
})
test('Set query again will overwrite it', () => {
	const req = new Request('http://localhost/test')
		.query({
			a: 1
		})
		.query({
			b: 1
		})
	expect(req.url().href).toBe('http://localhost/test?b=1')
})
test('Set url using URL', () => {
	const req = new Request(new URL('http://localhost/test?b=1')).url(
		new URL('http://localhost/foo')
	)
	expect(req.url().href).toBe('http://localhost/foo')
})
test('Set url after Set query will clear it', () => {
	const req = new Request('http://localhost/test')
		.query({
			a: 1
		})
		.url('/foo')
	expect(req.url().href).toBe('http://localhost/foo')
})
test('Set method to POST using post()', () => {
	const req = new Request('http://localhost/test').post()
	expect(req.method()).toBe('POST')
})
test('Set method to HEAD using method()', () => {
	const req = new Request('http://localhost/test').method('head')
	expect(req.method()).toBe('HEAD')
})
test('Set invalid method should throw', () => {
	expect(() =>
		new Request('https://localhost/test').method('aaa')
	).toThrowError(new TypeError('Unsupported HTTP method: AAA'))
})
test('Set header should work and ignore case', () => {
	const req = new Request('http://localhost/test')
		.get()
		.header('X-Test', '123')
	expect(req.header('x-test')).toBe('123')
})
test('Set header to null should delete it', () => {
	const req = new Request('http://localhost/test')
		.options()
		.header('X-Test', '123')
		.header('X-Test', null)
	expect(req.header()).toStrictEqual({})
})
test('Set header to array should work', () => {
	const req = new Request('http://localhost/test').header('X-Test', [
		'foo',
		'bar'
	])
	expect(req.header('x-test')).toEqual(['foo', 'bar'])
})
test('Set string body', () => {
	const req = new Request('http://localhost/test').put().body('body')
	expect(req.method()).toBe('PUT')
	expect(req.body().toString('utf-8')).toBe('body')
})
test('Set buffer body', () => {
	const buf = Buffer.from([1, 2, 3])
	const req = new Request('http://localhost/test').post().body(buf)
	expect(req.method()).toBe('POST')
	expect((req.body() as Buffer).equals(buf)).toBe(true)
})
test('Set json body', () => {
	const data = { foo: 'bar' }
	const req = new Request('http://localhost/test').delete().json(data)
	expect(req.method()).toBe('DELETE')
	expect(req.header('Content-Type')).toBe('application/json; charset=utf-8')
	expect(req.body().toString('utf-8')).toBe(JSON.stringify(data))
})
test('Set urlencoded body', () => {
	const data = { foo: 'bar' }
	const req = new Request('http://localhost/test').delete().urlencoded(data)
	expect(req.method()).toBe('DELETE')
	expect(req.header('Content-Type')).toBe(
		'application/x-www-form-urlencoded; charset=utf-8'
	)
	expect(req.body().toString('utf-8')).toBe('foo=bar')
})
test('Set form body', () => {
	const data = { foo: 'bar' }
	const req = new Request('http://localhost/test').delete().form(data)
	const buf = req.body()
	expect(buf.toString('utf-8')).toContain('name="foo"')
	expect(req.header('content-type')).toContain('multipart/form-data')
})
test('Set stream body', async () => {
	const stream = new Readable({
		read(size) {
			this.push('hello')
			this.push(null)
		}
	})
	const req = new Request('http://localhost/test').body(stream)
	const buf = await stream2buffer(req.body() as Readable)
	expect(buf.toString()).toBe('hello')
})
test('Request should be immutable', () => {
	const req1 = new Request('http://localhost/test').header(
		'X-Password',
		'hunter2'
	)
	const req2 = req1
		.head()
		.url('/api/get')
		.header('X-Password', null)
		.query({
			a: '1'
		})
	const data = {
		text: 'hello'
	}
	const req3 = req1
		.post()
		.url('/api/post')
		.json(data)

	expect(req1.url().href).toBe('http://localhost/test')
	expect(req1.header('X-Password')).toBe('hunter2')

	expect(req2.method()).toBe('HEAD')
	expect(req2.url().href).toBe('http://localhost/api/get?a=1')
	expect(req2.header('X-Password')).toBeUndefined()

	expect(req3.method()).toBe('POST')
	expect(req3.url().href).toBe('http://localhost/api/post')
	expect(req3.header('X-Password')).toBe('hunter2')
	expect(req3.body().toString()).toBe(JSON.stringify(data))
})
