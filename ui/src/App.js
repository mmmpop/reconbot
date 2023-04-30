import React from "react"
import mqtt from 'mqtt';
import useWASD from "use-wasd";
import axios from 'axios';
import SimpleKeyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './App.css';

const commandHistory = {};

const blankImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAGQCAYAAABWJQQ0AAAAAXNSR0IArs4c6QAAGRpJREFUeF7t1zENAAAMw7CVP+mxyOURqGTtyc4RIECAAAECBAgQIEAgEli0Y4YAAQIECBAgQIAAAQInQDwBAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQICBA/AABAgQIECBAgAABApmAAMmoDREgQIAAAQIECBAgIED8AAECBAgQIECAAAECmYAAyagNESBAgAABAgQIECAgQPwAAQIECBAgQIAAAQKZgADJqA0RIECAAAECBAgQIPCthwGRNeGzvAAAAABJRU5ErkJggg=="

function App() {
  const options = React.useRef({
    allow: ["arrowup"],
  });
  const keyboard = useWASD(options.current);

  const [connectionStatus, setConnectionStatus] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const client = React.useRef(null);

  const HOST= 'ws://localhost:9001/';

  React.useEffect(() => {
    if (!client.current) {
      client.current = mqtt.connect(HOST);

      client.current.on('connect', () => {
        console.log(`connected to ${HOST}`)
        setConnectionStatus(true)
        console.log('connection status', connectionStatus)
      });

      client.current.on('message', (topic, payload, packet) => {
        console.log(Date.now())
        console.log(topic, payload.toString())
        try {
          const payloadJSON = JSON.parse(payload.toString())
          const payloadRes = payloadJSON && payloadJSON.payload && payloadJSON.payload.res ? JSON.parse(payloadJSON.payload.res) : null
          payloadRes && console.log(topic, payloadRes.timestamp)
          // !payloadRes && console.warn('uh oh')
          if (topic === 'feeds/rover/feedback') {
            // const newMsgs = messages;
            // newMsgs[messages.length] = payload.toString();
            // setMessages(newMsgs);
          }
  
          if (topic === 'feeds/rover/status') {
            // setMessages([]);
            console.log('rover connected')
            // window.location.reload();
          }
  
          if (topic === 'feeds/rover/debug') {
            // const dateNow = Date.now()
            // const lastKey = Object.keys(commandHistory)
            // commandHistory[] = dateNow
            // console.log(commandHistory)
            if (payloadJSON && payloadJSON.payload) {
              // const payloadRes = JSON.parse(payloadJSON.payload.res)
              // console.log(payloadRes)
              // commandHistory[payloadRes.timestamp].arduinoAckd = payloadRes.timestamp
              // console.log('command history updated: ', commandHistory)
            }
          }
        }
        catch (err) {
          console.warn(err)
        }
      });

      client.current.subscribe('feeds/rover/status', (err) => {
        if (!err) {
          console.log('subscribed to `feeds/rover/status`')
        }
      })

      client.current.subscribe('feeds/rover/feedback', (err) => {
        if (!err) {
          console.log('subscribed to `feeds/rover/feedback`')
        }
      })

      client.current.subscribe('feeds/rover/error', (err) => {
        if (!err) {
          console.log('subscribed to `feeds/rover/error`')
        }
      })

      client.current.subscribe('feeds/rover/debug', (err) => {
        if (!err) {
          console.log('subscribed to `feeds/rover/debug`')
        }
      })
    }
  }, [messages, connectionStatus]);

  React.useEffect(() => {
    const thisTimestamp = Math.round(Date.now() / 1000)
    let body = { 
      package: { 
        keystroke: null,
      },
      timestamp: thisTimestamp
    }

    switch (true) {
      case (keyboard.arrowup):
        console.log('arrow up')
        body.package.keystroke = 'arrow_up'  
        body.timestamp = thisTimestamp 
        commandHistory[thisTimestamp] = { command: "arrow_up", speed_scalar: 5, wifiAckd: null, arduinoAckd: null }
        client.current.publish('feeds/rover/ui', JSON.stringify(JSON.stringify(body)))      
        break
      case (keyboard.arrowdown):
        console.log('arrow down')
        body.package.keystroke = 'arrow_down'
        body.timestamp = thisTimestamp 
        commandHistory[thisTimestamp] = { command: "arrow_down", speed_scalar: 5, wifiAckd: null, arduinoAckd: null }
        client.current.publish('feeds/rover/ui', JSON.stringify(JSON.stringify(body)))
        break
      case (keyboard.arrowleft):
        console.log('arrow left')
        body.package.keystroke = 'arrow_left'
        body.timestamp = thisTimestamp
        commandHistory[thisTimestamp] = { command: "arrow_left", speed_scalar: 5, wifiAckd: null, arduinoAckd: null }
        client.current.publish('feeds/rover/ui', JSON.stringify(JSON.stringify(body)))
        break
      case (keyboard.arrowright):
        console.log('arrow right')
        body.package.keystroke = 'arrow_right'
        body.timestamp = thisTimestamp
        commandHistory[thisTimestamp] = { command: "arrow_right", speed_scalar: 5, wifiAckd: null, arduinoAckd: null }
        client.current.publish('feeds/rover/ui', JSON.stringify(JSON.stringify(body)))
        break  
      case (keyboard.space):
        // console.log('space')
        body.package.keystroke = 'space'
        body.timestamp = thisTimestamp
        commandHistory[thisTimestamp] = { command: "space", wifiAckd: null, arduinoAckd: null }
        client.current.publish('feeds/rover/ui', JSON.stringify(JSON.stringify(body)))
        break                        
      default:
        break
    }
    // console.log(commandHistory)
  }, [keyboard]);

  const cameraPreviewEl = React.useRef(null);
  const cameraSnapshotEl = React.useRef(null);
  const [snapshotTime, setSnapshotTime] = React.useState(null);
  const beginCapture = React.useCallback(
    async () => {
      if (!cameraPreviewEl.current) {
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraPreviewEl.current.srcObject = stream;
      cameraPreviewEl.current.play();
    },
    [cameraPreviewEl]
  );

  const takeSnapshot = React.useCallback(
    () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
  
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      let image = new Image()
      image.crossOrigin = "anonymous"
      image.src = 'http://localhost:3000/video'
      setTimeout(() => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL()
          console.log(dataUrl)
          cameraSnapshotEl.current.src = dataUrl;
          setSnapshotTime(new Date())
      }, 500)
    },
    []
  );

  const classifyImage = React.useCallback(
    async () => {
      const apiKey = 'acc_3ee403f503f6081';
      const apiSecret = 'f09e03460411dbe4b9585f69181285f9';

      const url = 'https://api.imagga.com/v2/tags'

      const data = new FormData();
      data.append("image_base64", cameraSnapshotEl.current.src);
      data.append('username', apiKey);
      data.append('password', apiSecret);

      await fetch(
        url,
        {
          method: "POST",
          body: data,
        }
      )
        .then((res) => console.log(res))
        .catch((err) => console.log(err));

      // axios.post(url, { 'image_base64': cameraSnapshotEl.current.src, 'username': apiKey, 'password': apiSecret }, {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Accept': 'application/json',
      //     }
      //   })
      //   .then((response) => {
      //     console.log(response)
      //   })
      //   .catch((error) => {
      //     console.error(error)
      //   })
      // },
      
    }, []
  )
  
  if (!client.current) { return null }
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>RECONBOT</h1>
        {/* <div id="code"><pre>{ messages[0] }</pre></div> */}
        {
          // (() => {
          //   return messages.map((val, key) => {
          //     return (
          //       <p key={key}>{ JSON.parse(val).timestamp }</p>
          //     )
          //   })
          // })()
        }
      </header>
      {
        <>
          <h2>Live Feed</h2>
          <img 
            alt="Camera Feed"
            src="http://localhost:3000/video"
            width="400" 
            height="300" 
            ref={cameraPreviewEl}
          />
        </>
      }
      <div>
        <button   
          onClick={() => {
            takeSnapshot()
          }}
        >Take a photo</button>
      </div>
      <div>
        <h3>Image Classifier</h3>
        { !cameraSnapshotEl.current && cameraSnapshotEl.current === null && <p>Take an image to classify!</p> } 
        <img 
          // style={ { display: cameraSnapshotEl.current ? 'inline' : 'none' } } 
          ref={cameraSnapshotEl} 
          alt="Last snapshot" 
        />
        <p>{ snapshotTime && `Image generated at ${ snapshotTime.toISOString() }` }</p>
      </div>
      <div>
        <button   
          onClick={() => {
            classifyImage()
          }}
        >Submit image for classification</button>
      </div>
      <br />
      <br />
      <br />
      <br />
      {/* <SimpleKeyboard
        onChange={(input) => { console.log('onChange', input) }}
        onKeyPress={(button) => { console.log('onKeyPress', button) }}
      /> */}
    </div>
  );
}

export default App;
