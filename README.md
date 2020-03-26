# Chaining & Immutable node.js request library

Examples:

```js
const api = request('https://example.com/api/').header('Authorization', 'Bearer <token>')

base.get()
	.url('get') // GET /api/get
	.query({ id: 7 }) // GET /api/get?id=7
	.send()
	.then(resp => resp.json())
	.then(json => {
		console.log(json)
	})

base.post()
	.url('img/upload') // POST /api/img/upload
	.form({ // multipart/form-data
		file: fs.readFileSync('./image.png')
	})
	.send()
	.then(resp => resp.json())
	.then(json => {
		console.log(json)
	})

request('https://example.com/logo.png')
	.then(resp => {
		// fetch an image to save it to file using stream
		resp.stream().pipe(fs.createWriteStream('./logo.png'))
	})
```
