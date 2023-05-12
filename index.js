const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const app = express()

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
const cors = require('cors')
app.use(cors({ optionsSuccessStatus: 200 })) // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html')
})

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.status(200)
  res.json({ greeting: 'hello Timestamp API' })
})

// A request to /api/:date? with a valid date should return a
// JSON object with a utc key that is a string of the input date in the
//  Thu, 01 Jan 1970 00:00:00 GMT
//  format: Thu, 01 Jan 1970 00:00:00 GMT

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

  const timestamp = parseInt(date)
  const utcFromTimestamp = new Date(timestamp)
  const utcDate = new Date(date)

  if (isNaN(timestamp) && isNaN(utcDate)) {
    res.status(400)
    res.send({ error: 'Invalid Date' })
  } else {

    if (isNaN(timestamp) && utcDate instanceof Date) {
      res.status(200)
      res.send({
        utc: utcDate.toUTCString(),
        unix: utcDate.getTime()
      })
    }

    if (!isNaN(timestamp) && utcFromTimestamp instanceof Date) {
      res.status(200)
      return res.send({
        unix: timestamp,
        utc: utcFromTimestamp.toUTCString(),
      })
    }
  }
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
