import { createServer, ServerResponse, IncomingMessage, Server } from 'http'
import { AddressInfo } from 'net'
import { parse } from 'url'

export interface Mock {
	address: AddressInfo
	url: string
	waitFor: (path: string) => Promise<[IncomingMessage, ServerResponse]>
	server: Server
}

export default (): Promise<Mock> => {
	const callbacks: { [path: string]: any } = {}
	const server = createServer((request, response) => {
		if (!request.url) return
		const u = parse(request.url)
		if (!u.pathname) return
		if (typeof callbacks[u.pathname] === 'function') {
			callbacks[u.pathname]([request, response])
			delete callbacks[u.pathname]
		}
	})
	const waitFor = (
		path: string
	): Promise<[IncomingMessage, ServerResponse]> =>
		new Promise(resolve => {
			callbacks[path] = resolve
		})
	return new Promise(resolve => {
		server.listen(0, '0.0.0.0', () => {
			const addr = server.address() as AddressInfo // listening on http only returns AddressInfo
			resolve({
				address: addr,
				url: `http://${addr.address}:${addr.port}`,
				waitFor,
				server
			})
		})
	})
}
