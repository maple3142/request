import { Response } from './response'
import { URL } from 'url'
import { Readable } from 'stream'
import { ParsedUrlQueryInput, stringify } from 'querystring'
import { request as httpRequest } from 'http'
import { request as httpsRequest } from 'https'
import produce, { immerable } from 'immer'
import ReadableStreamClone from 'readable-stream-clone'
import FormData = require('form-data')

export class Headers {
	[key: string]: string
}
export enum HttpMethods {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	OPTIONS = 'OPTIONS',
	HEAD = 'HEAD'
}
export class Request {
	[immerable] = true
	_url: URL
	_method = HttpMethods.GET
	_headers: Headers = {}
	_body?: Readable | Buffer
	constructor(url: string | URL) {
		this._url = typeof url === 'string' ? new URL(url) : url
	}
	url(): URL
	url(url: string | URL): Request
	url(url?: string | URL): Request | URL {
		if (typeof url === 'undefined') return this._url
		const strUrl = typeof url !== 'string' ? url.href : url
		return produce(this, s => {
			// PS: this will overwrite query
			s._url = new URL(strUrl, this._url)
		})
	}
	query(obj: ParsedUrlQueryInput): Request {
		const query = stringify(obj)
		return produce(this, s => {
			s._url.search = query
		})
	}
	method(): HttpMethods
	method(method: HttpMethods | string): Request
	method(method?: HttpMethods | string): Request | HttpMethods {
		if (typeof method === 'undefined') {
			return this._method
		} else {
			// PS: enum is string too
			method = method.toUpperCase()
			if (method in HttpMethods) {
				return produce(this, s => {
					s._method = method as HttpMethods
				})
			} else {
				throw new TypeError('Unsupported HTTP method: ' + method)
			}
		}
	}
	get(): Request {
		return produce(this, s => {
			s._method = HttpMethods.GET
		})
	}
	post(): Request {
		return produce(this, s => {
			s._method = HttpMethods.POST
		})
	}
	put(): Request {
		return produce(this, s => {
			s._method = HttpMethods.PUT
		})
	}
	delete(): Request {
		return produce(this, s => {
			s._method = HttpMethods.DELETE
		})
	}
	options(): Request {
		return produce(this, s => {
			s._method = HttpMethods.OPTIONS
		})
	}
	head(): Request {
		return produce(this, s => {
			s._method = HttpMethods.HEAD
		})
	}
	header(): Headers
	header(key: string): string
	header(key: string, value: string | null): Request
	header(newHeaders: Headers): Request
	header(
		arg1?: string | Headers,
		arg2?: string | null
	): Request | Headers | string {
		if (typeof arg1 === 'undefined' && typeof arg2 === 'undefined') {
			return this._headers
		} else if (typeof arg1 === 'string' && typeof arg2 === 'undefined') {
			return this._headers[arg1.toLowerCase()]
		} else if (typeof arg1 === 'string' && typeof arg2 !== 'undefined') {
			const key = arg1.toLowerCase()
			const value = arg2
			if (value === null) {
				// delete if null or undefined
				return produce(this, s => {
					delete s._headers[key]
				})
			}
			return produce(this, s => {
				s._headers[key] = value
			})
		} else {
			return produce(this, s => {
				Object.assign(s._headers, arg1)
			})
		}
	}
	body(): Readable | Buffer
	body(str: string): Request
	body(str: Buffer): Request
	body(stream: Readable): Request
	body(
		arg?: string | Buffer | Readable
	): Request | Readable | Buffer | undefined {
		if (typeof arg === 'undefined') {
			return this._body
		}
		if (typeof arg === 'string') {
			return produce(this, s => {
				s._body = Buffer.from(arg)
			})
		} else {
			return produce(this, s => {
				s._body = arg
			})
		}
	}
	json(obj: any): Request {
		return this.body(JSON.stringify(obj)).header(
			'Content-Type',
			'application/json; charset=utf-8'
		)
	}
	form(obj: object | FormData): Request {
		const form = obj instanceof FormData ? obj : objectToFormData(obj)
		return this.body(form.getBuffer()).header(form.getHeaders())
	}
	urlencoded(obj: ParsedUrlQueryInput): Request {
		return this.body(stringify(obj)).header(
			'Content-Type',
			'application/x-www-form-urlencoded; charset=utf-8'
		)
	}
	send(): Promise<Response> {
		const makeRequest =
			this._url.protocol === 'https:' ? httpsRequest : httpRequest
		return new Promise((resolve, reject) => {
			const request = makeRequest(
				this._url,
				{
					method: this._method,
					headers: this._headers
				},
				msg => resolve(new Response(msg))
			)
			request.on('error', err => reject(err))
			if (
				this._method !== HttpMethods.GET &&
				this._method !== HttpMethods.HEAD &&
				this._body
			) {
				const origBody = this._body
				if (Buffer.isBuffer(origBody)) {
					const stream = new Readable({
						read(size) {
							this.push(origBody)
							this.push(null)
						}
					})
					stream.pipe(request)
				} else {
					new ReadableStreamClone(origBody).pipe(request)
				}
			} else {
				request.end()
			}
		})
	}
}
function objectToFormData(obj: object) {
	const form = new FormData()
	for (const [k, v] of Object.entries(obj)) {
		form.append(k, v)
	}
	return form
}
