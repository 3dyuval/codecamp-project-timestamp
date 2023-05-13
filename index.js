const dotenv = require('dotenv')
dotenv.config()

const fs = require('node:fs')
const utils = require('node:util')
const createLocalMiddleware = require('express-locale')
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')

const app = express()
app.use(cors({ optionsSuccessStatus: 200 }))

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(
	createLocalMiddleware({
		default: 'en-US',
	})
)

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/views/index.html')
})

app.get('/api/whoami', function (req, res) {
	const { language: language } = req.locale
	const software = req.get('user-agent')
	res.json({ ipaddress: req.ip, language, software })
})

app.get('/api/hello', function (req, res) {
	res.status(200)
	res.json({ greeting: 'hello API' })
})

app.get('/api', function (req, res) {
	res.status(200)
	return res.send({
		utc: new Date().toUTCString(),
		unix: Date.now(),
	})
})

app.get('/api/:date?', function (req, res) {
	const { date } = req.params

	if (date === undefined) {
		res.status(200)
		return res.send({
			utc: new Date().toUTCString(),
			unix: Date.now(),
		})
	}

	let timestamp
	let parsedDat

	if (/^\d+$/.test(date)) {
		// Case: Unix timestamp
		parsedDate = new Date(parseInt(date))
		timestamp = parsedDate.getTime()
	} else {
		// Case: Date string
		parsedDate = new Date(date)
		timestamp = parsedDate.getTime()
	}

	if (isNaN(timestamp) && parsedDate.toString() === 'Invalid Date') {
		res.status(400)
		res.send({ error: parsedDate.toString() })
	} else {
		res.status(200)
		return res.send({
			unix: timestamp,
			utc: parsedDate.toUTCString(),
		})
	}
})

app.post('/api/short?', function (req, res) {

	try {
		new URL(req.body.url)
	} catch {
		res.status(400)
		res.send({ error: 'Invalid url' })
		return
	}

	let original_url = req.body.url
	let short_url_index

	fs.readFile('./shorted_urls.json', 'utf8', function (err, data) {
		if (err) {
			throw err
		}
		const { urls } = JSON.parse(data)
		urls.push(original_url)
		short_url_key = urls.length - 1

		fs.writeFile('./shorted_urls.json', JSON.stringify({ urls }), function (err) {
			if (err) {
				throw err
			}
			res.status(201)
			res.send({ original_url, short_url: short_url_key })
		})
	})
})

const readFile = utils.promisify(fs.readFile)

const getUrl = async (shorturl) => {
	try {
		const file = await readFile('./shorted_urls.json', 'utf8')
		if (!file) {
			throw new Error('Something went wrong with reading file')
		}

		const { urls } = JSON.parse(file)
		let url = urls[shorturl]
		if (!url) {
			throw new Error('Not found')
		}
		return url
		
	} catch (err) {
		throw new Error('Error reading file or Url not found')
	}
}

app.get('/api/shorturl/:shorturl?', function (req, res) {
	const { shorturl } = req.params

	getUrl(shorturl)
		.then(url => {
			 res.redirect(302, url)
		})
		.catch(err => {
			res.status(404).send(err.message)
		})
})

const listener = app.listen(process.env.PORT, function () {
	console.log('Your app is listening on port ' + listener.address().port)
})
