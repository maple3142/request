import { URL } from 'url'
import { Request } from './request'

export = function(url: string | URL) {
	return new Request(url)
}
