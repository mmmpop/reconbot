'use strict'

const mqtt = require('mqtt')
const express = require('express')
const bodyParser = require('body-parser')
const FormData = require('form-data');
const vision = require('@google-cloud/vision');
const app = express()
const port = 8888

const client = mqtt.connect()
const visionClient = new vision.ImageAnnotatorClient();

app.use(bodyParser.json())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use((req, res, next) => {
  const allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);

  return next();
});

app.post('/classify', async (req, res) => {
  const base64 = Object.keys(req.body)[0]
  // console.log(base64)
  // console.log(base64.replace(/\s{2}/g, '++').replace(/\s{1}/g, '+'))
  const request = {
    image: {
      content: base64.replace(/\s{2}/g, '++').replace(/\s{1}/g, '+').split("base64,")[1]
    }
  };
  const [result] = await visionClient.webDetection(request);
  // console.log('Result: ');
  // console.log(result)
  res.json(result);
  // res.json({})
})

app.listen(port, () => {
  console.log(`Server app listening on port ${port}`)
})

app.use(express.static('./public'));

client.subscribe('feeds/rover/server')
client.on('message', function (topic, message) {
  console.log(topic)
  console.log(message.toString())
  client.publish('feeds/rover/classifier', JSON.stringify({ payload: { res: null } }))
})

