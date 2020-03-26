import request = require('./src/index')
import { readFileSync } from 'fs-extra'

request('https://api.imgur.com/3/image')
	.header('Authorization', 'Client-ID a9ef68b580d88c1')
	.post()
	.form({
		image: readFileSync(__dirname + '/test/pusheen.jpg')
	})
	.send()
	.then(resp => resp.json())
	.then(console.log)
	.catch(console.error)
