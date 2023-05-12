const dotenv = require('dotenv')
dotenv.config()

const fs = require('node:fs')
const createLocalMiddleware = require('express-locale')
const cors = require('cors')
const express = require('express')
const app = express()
app.use(cors({ optionsSuccessStatus: 200 }))

app.use(express.static('public'))
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

	if (date === undefined) {
		res.status(200)
		return res.send({
			utc: new Date().toUTCString(),
			unix: Date.now(),
		})
	} else if (isNaN(timestamp) && parsedDate.toString() === 'Invalid Date') {
		res.status(400)
		res.send({ error: 'Invalid Date' })
	} else {
		res.status(200)
		return res.send({
			unix: timestamp,
			utc: parsedDate.toUTCString(),
		})
	}
})

app.post('/api/short/:shorturl?', function (req, res) {
	try {
		new URL(req.params.shorturl)
		return true
	} catch {
		res.status(400)
		res.send({ error: 'Invalid url' })
		return
	}

	let original_url = req.params.shorturl
	let short_url

	fs.readFile('./shorted_urls.json', 'utf8', function (err, data) {
		if (err) {
			throw err
		}
		const { urls } = JSON.parse(data)
		urls.push({ [urls.length + 1]: original_url })
		short_url = urls.length

		fs.writeFile('./shorted_urls.json', JSON.stringify({ urls }), function (
			err
		) {
			if (err) {
				throw err
			}
			res.status(201)
			res.send({ original_url, short_url })
		})
	})
})

const listener = app.listen(process.env.PORT, function () {
	console.log('Your app is listening on port ' + listener.address().port)
})
