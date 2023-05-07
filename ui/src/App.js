import React, { useState } from "react"
import mqtt from 'mqtt';
import useWASD from "use-wasd";
import axios from 'axios';
import { LineChart, XAxis, YAxis, CartesianGrid, Line } from 'recharts'

import 'react-simple-keyboard/build/css/index.css';
import './App.css';

const commandHistory = {};

const keywords = [
  'hot dog', 
  'bun', 
  'sausage', 
  'frankfurter',
  'frank',
  'weiner'
]

let count = 0

function App() {
  const options = React.useRef({
    allow: ["arrowup"],
  });
  const keyboard = useWASD(options.current);

  const [connectionStatus, setConnectionStatus] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const client = React.useRef(null);

  const HOST= 'ws://localhost:9001/';

  const [counter, setCounter] = useState(1) 
  const [tempData, setTempData] = React.useState(null)
  const [altData, setAltData] = React.useState(null)

  React.useEffect(() => {

    setInterval(() => {
      setTempData(envData.temp_data.slice(0, count))
      setAltData(envData.altitude_data.slice(0, count))
      count++
      
    }, 2500)
  }, [])

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

          if (topic === 'feeds/rover/classifier') {
            // setMessages([]);
            console.log('classifier service sent a message')
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

      client.current.subscribe('feeds/rover/classifier', (err) => {
        if (!err) {
          console.log('subscribed to `feeds/rover/classifier`')
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
  const [dataUrl, setDataUrl] = React.useState();
  const [snapshotTime, setSnapshotTime] = React.useState(null);
  const [categoryData, setCategoryData] = React.useState(null);
  const [showHotdogStatus, setShowHotdogStatus] = React.useState(false);
  const [isHotdog, setIsHotdog] = React.useState(false);

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
        const data_url = canvas.toDataURL()
        cameraSnapshotEl.current.src = data_url;
        setDataUrl(data_url)
        setSnapshotTime(new Date())
      }, 500)
    },
    []
  );

  const classifyImage = () => {
    if (!dataUrl) {
      console.warn('cowardly refusing to send message upstream with no data')
    }
    else {
      let timeout
      // console.log(dataUrl)
      axios.post('http://localhost:8888/classify', dataUrl, {
        headers: {
          'accept': 'application/json'
        }
      })
      .then((response) => {
        console.log(response.data);
        setCategoryData(response.data)

        response.data.webDetection.bestGuessLabels.map((val, key) => {            
          console.log(val.label.toLowerCase())
          if (keywords.includes(val.label.toLowerCase())) {
            setIsHotdog(true)
          }
          return null
        }) 

        response.data.webDetection.webEntities.map((val, key) => {            
          console.log(val.description.toLowerCase())
          if (keywords.includes(val.description.toLowerCase())) {
            setIsHotdog(true)
          }
          return null
        }) 
        setShowHotdogStatus(true)
        timeout = setTimeout(() => {
          setShowHotdogStatus(false)
        }, 5000)
      }, (error) => {
        clearTimeout(timeout)
        timeout = null
        console.log(error);
      });

      // client.current.publish('feeds/rover/server', JSON.stringify({ payload: { data: data } }))
      // client.current.publish('feeds/rover/server', JSON.stringify(ab))
    }
  }
  
  if (!client.current) { return null }
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>RECONBOT</h1>
      </header>
      {
        <>
          <h1>Live Feed</h1>
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
      <div style={ { position: 'relative', margin: '0 auto', width: '800px' } }>
        <h1>Image Classifier</h1>
        { !cameraSnapshotEl.current && cameraSnapshotEl.current === null && <p>Take an image to classify!</p> } 
        <div
          style={ 
            { 
              position: 'absolute', 
              backgroundImage: isHotdog ? 'url(http://localhost:8888/is_hotdog.png)' : 'url(http://localhost:8888/not_hotdog.png)',
              height: '600px',
              width: '800px',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top',
              display: showHotdogStatus ? 'block' : 'none'
            } 
          }
        />
        <div>
          <img 
            ref={cameraSnapshotEl} 
            alt="Last snapshot" 
          />
        </div>

        <p>{ snapshotTime && `Image generated at ${ snapshotTime.toISOString() }` }</p>
      </div>
      <div>
        <button   
          onClick={() => {
            classifyImage()
          }}
        >Submit image for classification</button>
      </div>
      {
        categoryData && 
          <div>
            <br />
            <h2>BEST GUESS</h2>            
            <ul style={ { padding: 0 } }>
              { 
                categoryData.webDetection.bestGuessLabels.map((val, key) => {            
                  return <li style={ { listStyleType: 'none', fontWeight: 'bold' } } key={ val.label }><h4>{ `${val.label}` }</h4></li>
                }) 
              }
            </ul>
            <br />
            <h3>OTHER GUESSES</h3>            
            <ul style={ { padding: 0 } }>
              { 
                categoryData.webDetection.webEntities.map((val, key) => {            
                  return <li style={ { listStyleType: 'none', fontWeight: 'bold' } } key={ val.description + val.score }>{ `${key + 1}. ${val.description} (${val.score})` }</li>
                }) 
              }
            </ul>
          </div>
      }
      <br />
      <br />
      <div>
        <h1>Temperature Data</h1>
        <LineChart style={ { textAlign: 'center', margin: '0 auto' } } width={800} height={600} data={tempData}>
          <XAxis dataKey="name"/>
          <YAxis/>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
          <Line type="monotone" dataKey="val" stroke="#8884d8" />
        </LineChart>
      </div>
      <div>
        <h1>Altitude Data</h1>
        <LineChart style={ { textAlign: 'center', margin: '0 auto' } } width={800} height={600} data={altData}>
          <XAxis dataKey="name"/>
          <YAxis/>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
          <Line type="monotone" dataKey="val" stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
}

export default App;

const envData = { 
  "altitude_data": [
    { "val": 4812.2005675530545 },
    { "val": 4820.0934471134315 },
    { "val": 4820.9366410850935 },
    { "val": 4817.797786561402 },
    { "val": 4816.936572088649 },
    { "val": 4810.032378022148 },
    { "val": 4820.601745005116 },
    { "val": 4823.601614056238 },
    { "val": 4822.259930519348 },
    { "val": 4829.906414536484 },
    { "val": 4829.281438224009 },
    { "val": 4817.4107383028595 },
    { "val": 4814.185080633054 },
    { "val": 4826.0790542193845 },
    { "val": 4812.842213172126 },
    { "val": 4818.398463148036 },
    { "val": 4816.301633654654 },
    { "val": 4823.809488186483 },
    { "val": 4811.76006812595 },
    { "val": 4816.385213761987 },
    { "val": 4816.826377679963 },
    { "val": 4811.760044164689 },
    { "val": 4827.689743943258 },
    { "val": 4814.110510964039 },
    { "val": 4826.749401216959 },
    { "val": 4819.998924354645 },
    { "val": 4812.40645803583 },
    { "val": 4828.775072712421 },
    { "val": 4828.51805538183 },
    { "val": 4815.475607328141 },
    { "val": 4819.450222239475 },
    { "val": 4814.134781733911 },
    { "val": 4817.922509453165 },
    { "val": 4818.157643062411 },
    { "val": 4819.7835831531875 },
    { "val": 4810.036801702926 },
    { "val": 4828.411111886737 },
    { "val": 4823.762003668277 },
    { "val": 4810.886868104354 },
    { "val": 4827.469851428349 },
    { "val": 4821.235302879929 },
    { "val": 4816.8647537351135 },
    { "val": 4815.339634809685 },
    { "val": 4823.294869557149 },
    { "val": 4823.832735504471 },
    { "val": 4826.626774940107 },
    { "val": 4823.658916694191 },
    { "val": 4827.392029078083 },
    { "val": 4818.300211318174 },
    { "val": 4810.0601197353835 },
    { "val": 4816.758525466199 },
    { "val": 4825.082228301641 },
    { "val": 4829.300165018836 },
    { "val": 4812.783961587829 },
    { "val": 4829.650821747109 },
    { "val": 4819.710183617764 },
    { "val": 4827.522520666241 },
    { "val": 4824.917938648338 },
    { "val": 4810.267803203315 },
    { "val": 4821.853998993684 },
    { "val": 4828.057160085368 },
    { "val": 4823.152329686044 },
    { "val": 4822.018364419149 },
    { "val": 4820.036979316073 },
    { "val": 4825.665540180534 },
    { "val": 4821.992954296167 },
    { "val": 4816.37983411677 },
    { "val": 4825.662145707611 },
    { "val": 4828.626732808687 },
    { "val": 4813.972912906211 },
    { "val": 4810.595490753499 },
    { "val": 4815.170650757781 },
    { "val": 4819.851771411439 },
    { "val": 4813.109948596516 },
    { "val": 4815.274644284815 },
    { "val": 4828.884176311508 },
    { "val": 4828.574002990717 },
    { "val": 4816.960800810223 },
    { "val": 4819.543948421592 },
    { "val": 4812.526856149732 },
    { "val": 4824.494000979853 },
    { "val": 4825.751791942264 },
    { "val": 4821.491526081983 },
    { "val": 4814.967883665019 },
    { "val": 4828.352987173261 },
    { "val": 4816.551354656927 },
    { "val": 4824.09243406817 },
    { "val": 4817.587078125559 },
    { "val": 4817.375819204917 },
    { "val": 4824.87586175335 },
    { "val": 4823.06869205669 },
    { "val": 4826.721008157438 },
    { "val": 4820.385741315176 },
    { "val": 4813.967736582404 },
    { "val": 4817.505872813313 },
    { "val": 4824.964116883062 },
    { "val": 4820.078332143177 },
    { "val": 4815.599074411886 },
    { "val": 4812.6139564776595 },
    { "val": 4815.979030952961 },
    { "val": 4814.298198099154 },
    { "val": 4823.674912025462 },
    { "val": 4810.317408016896 },
    { "val": 4815.886262945222 },
    { "val": 4814.803463008126 },
    { "val": 4814.829699767099 },
    { "val": 4820.397159926674 },
    { "val": 4826.373865785971 },
    { "val": 4826.583133002951 },
    { "val": 4820.904294082487 },
    { "val": 4813.719278336668 },
    { "val": 4827.005040120016 },
    { "val": 4813.476937251264 },
    { "val": 4812.952004364523 },
    { "val": 4811.791088514355 },
    { "val": 4810.025862737515 },
    { "val": 4821.09364099214 },
    { "val": 4824.200533866428 },
    { "val": 4826.776640501768 },
    { "val": 4825.458136797133 },
    { "val": 4810.031595217559 },
    { "val": 4819.039599865283 },
    { "val": 4811.940508911875 },
    { "val": 4824.950882636719 },
    { "val": 4823.854576809474 },
    { "val": 4822.7233225701175 },
    { "val": 4823.3407587628735 },
    { "val": 4810.88902344498 },
    { "val": 4812.33151478763 },
    { "val": 4814.877766828156 },
    { "val": 4824.730260036046 },
    { "val": 4817.652448493347 },
    { "val": 4812.991429721676 },
    { "val": 4823.425816865525 },
    { "val": 4821.115114344555 },
    { "val": 4823.812342182103 },
    { "val": 4811.7444161254125 },
    { "val": 4828.739402772099 },
    { "val": 4815.678913911015 },
    { "val": 4826.7196604623505 },
    { "val": 4810.103693923829 },
    { "val": 4820.424752819415 },
    { "val": 4813.426273300457 },
    { "val": 4815.114395674254 },
    { "val": 4814.15351070745 },
    { "val": 4819.369657514766 },
    { "val": 4814.526972919525 },
    { "val": 4816.49265517892 },
    { "val": 4811.622297127616 },
    { "val": 4821.248867018803 },
    { "val": 4819.339889804521 },
    { "val": 4824.0450722651285 },
    { "val": 4815.070533948133 },
    { "val": 4810.026220335183 },
    { "val": 4812.826548643742 },
    { "val": 4813.192068209222 },
    { "val": 4822.2533377123855 },
    { "val": 4811.897951020125 },
    { "val": 4828.33818640791 },
    { "val": 4820.78552095012 },
    { "val": 4824.9534196128025 },
    { "val": 4827.40432939239 },
    { "val": 4819.211448486684 },
    { "val": 4827.1159047056335 },
    { "val": 4826.370264354708 },
    { "val": 4812.56044348321 },
    { "val": 4814.209690718312 },
    { "val": 4829.922270029556 },
    { "val": 4823.157197362057 },
    { "val": 4821.212035923435 },
    { "val": 4823.937123387541 },
    { "val": 4823.990335268556 },
    { "val": 4824.827256496249 },
    { "val": 4822.817206680186 },
    { "val": 4826.786794710703 },
    { "val": 4813.719688535896 },
    { "val": 4824.440191659893 },
    { "val": 4824.724592087866 },
    { "val": 4828.312856832633 },
    { "val": 4817.3402364357025 },
    { "val": 4821.178627770408 },
    { "val": 4829.731105040439 },
    { "val": 4813.277264247628 },
    { "val": 4820.475822339317 },
    { "val": 4829.9084674347505 },
    { "val": 4814.936163329013 },
    { "val": 4822.47210462766 },
    { "val": 4813.861333538339 },
    { "val": 4828.383523746399 },
    { "val": 4828.939970687568 },
    { "val": 4829.315543296443 },
    { "val": 4815.179840146042 },
    { "val": 4815.364319793667 },
    { "val": 4814.910957622867 },
    { "val": 4815.328932081576 },
    { "val": 4821.476828499254 },
    { "val": 4821.670364610262 },
    { "val": 4817.906322320661 },
    { "val": 4811.349212497999 },
    { "val": 4825.862936970769 },
    { "val": 4827.182137192125 },
    { "val": 4817.0464567200825 },
    { "val": 4827.441496238449 },
    { "val": 4825.293039007112 },
    { "val": 4816.011844960847 },
    { "val": 4826.953273900326 },
    { "val": 4815.742498031131 },
    { "val": 4826.335275583892 },
    { "val": 4827.679542447558 },
    { "val": 4823.775098229569 },
    { "val": 4815.317707344622 },
    { "val": 4815.048666877184 },
    { "val": 4823.907455723516 },
    { "val": 4810.645763995166 },
    { "val": 4827.0078699164715 },
    { "val": 4823.803880465949 },
    { "val": 4813.115743565457 },
    { "val": 4815.0252349893935 },
    { "val": 4815.528134762874 },
    { "val": 4812.010241034587 },
    { "val": 4824.039181256403 },
    { "val": 4812.75133179243 },
    { "val": 4827.433607095599 },
    { "val": 4819.369908583157 },
    { "val": 4829.94915177451 },
    { "val": 4828.87769508241 },
    { "val": 4815.965905425822 },
    { "val": 4828.13157698339 },
    { "val": 4821.575443845745 },
    { "val": 4819.136860613884 },
    { "val": 4828.16822298526 },
    { "val": 4827.851042986234 },
    { "val": 4816.533784118818 },
    { "val": 4812.778517359469 },
    { "val": 4818.499484689394 },
    { "val": 4828.381623219413 },
    { "val": 4818.6498153884995 },
    { "val": 4825.578059576858 },
    { "val": 4810.030620497245 },
    { "val": 4817.018876257379 },
    { "val": 4813.683549452899 },
    { "val": 4813.899061261225 },
    { "val": 4815.2974337950245 },
    { "val": 4814.670208068507 },
    { "val": 4824.611192657605 },
    { "val": 4812.657227871519 },
    { "val": 4827.04315793057 },
    { "val": 4826.04941423387 },
    { "val": 4813.042975075275 },
    { "val": 4812.644131385483 },
    { "val": 4827.20783281009 },
    { "val": 4826.846014908726 },
    { "val": 4822.413070944283 },
    { "val": 4810.614514300485 },
    { "val": 4814.728996177455 },
    { "val": 4814.087622518105 },
    { "val": 4822.004606857524 },
    { "val": 4829.28536078832 },
    { "val": 4827.240647771491 },
    { "val": 4822.285743771186 },
    { "val": 4815.067205418412 },
    { "val": 4824.407954569089 },
    { "val": 4810.3820892809035 },
    { "val": 4829.311263745775 },
    { "val": 4810.625473175634 },
    { "val": 4814.654810356269 },
    { "val": 4816.524235380706 },
    { "val": 4826.056390165886 },
    { "val": 4824.388072579495 },
    { "val": 4812.573328354932 },
    { "val": 4819.571761410891 },
    { "val": 4813.9684446301035 },
    { "val": 4815.62101446159 },
    { "val": 4824.08327621779 },
    { "val": 4824.474163276522 },
    { "val": 4815.732963197556 },
    { "val": 4825.191819411996 },
    { "val": 4821.152328815651 },
    { "val": 4820.828917481614 },
    { "val": 4824.112130714383 },
    { "val": 4815.598503124477 },
    { "val": 4819.239944993149 },
    { "val": 4828.4237892526835 },
    { "val": 4817.392712834029 },
    { "val": 4824.464278440498 },
    { "val": 4822.739555767046 },
    { "val": 4823.767729384003 },
    { "val": 4816.784602326362 },
    { "val": 4824.867064825591 },
    { "val": 4822.415933021863 },
    { "val": 4820.62047079945 },
    { "val": 4827.9128669371585 },
    { "val": 4829.72406212982 },
    { "val": 4828.102164827886 },
    { "val": 4824.207304941442 },
    { "val": 4815.825798299963 },
    { "val": 4810.151488485837 },
    { "val": 4822.992512746763 },
    { "val": 4820.353575078782 },
    { "val": 4822.45583482725 },
    { "val": 4826.214943410588 },
    { "val": 4822.669648334207 },
    { "val": 4823.78676703178 },
    { "val": 4828.990764231886 },
    { "val": 4813.935505089277 },
    { "val": 4810.626320951166 },
    { "val": 4820.227169161268 },
    { "val": 4822.951828523936 },
    { "val": 4824.584331829149 },
    { "val": 4810.601744800023 },
    { "val": 4817.768564379096 },
    { "val": 4823.588103381123 },
    { "val": 4814.312996324134 },
    { "val": 4823.091141819526 },
    { "val": 4812.155037997198 },
    { "val": 4814.711237693986 },
    { "val": 4819.755302079286 },
    { "val": 4825.953705911192 },
    { "val": 4828.6386817153125 },
    { "val": 4829.806574873596 },
    { "val": 4819.142758409864 },
    { "val": 4815.53179991692 },
    { "val": 4823.497102390307 },
    { "val": 4828.025428302427 },
    { "val": 4816.539788727737 },
    { "val": 4823.3132046538285 },
    { "val": 4820.926782456292 },
    { "val": 4810.171685988529 },
    { "val": 4829.216038134989 },
    { "val": 4819.543617320387 },
    { "val": 4825.401249490358 },
    { "val": 4825.666792788722 },
    { "val": 4817.096918174018 },
    { "val": 4823.67907025859 },
    { "val": 4818.174154653928 },
    { "val": 4813.293959135134 },
    { "val": 4814.52255599832 },
    { "val": 4825.01855633665 },
    { "val": 4818.303961272449 },
    { "val": 4825.778611258401 },
    { "val": 4828.93447261997 },
    { "val": 4818.157759271009 },
    { "val": 4812.843568278044 },
    { "val": 4820.495599688008 },
    { "val": 4829.391315106544 },
    { "val": 4811.210238356317 },
    { "val": 4822.990066407098 },
    { "val": 4828.806953113385 },
    { "val": 4821.080926335975 },
    { "val": 4810.789901507478 },
    { "val": 4820.944751888504 },
    { "val": 4827.694988608224 },
    { "val": 4825.678145422077 },
    { "val": 4821.093182590483 },
    { "val": 4827.619040407718 },
    { "val": 4814.788768262665 },
    { "val": 4810.114343140472 },
    { "val": 4823.9239178908465 },
    { "val": 4812.668842475444 },
    { "val": 4813.663042085326 },
    { "val": 4815.622898594563 },
    { "val": 4817.147342808618 },
    { "val": 4819.411028194935 },
    { "val": 4819.772148826077 },
    { "val": 4812.582108257748 },
    { "val": 4825.422682519809 },
    { "val": 4829.578581956303 },
    { "val": 4829.157931151746 },
    { "val": 4816.700114693221 },
    { "val": 4818.296688520353 },
    { "val": 4826.61473686601 },
    { "val": 4810.929788501018 },
    { "val": 4828.631295118698 },
    { "val": 4818.703190007681 },
    { "val": 4810.372427600815 },
    { "val": 4821.42943749132 },
    { "val": 4811.861220362929 },
    { "val": 4828.8911310882195 },
    { "val": 4822.520019698285 },
    { "val": 4818.684318381988 },
    { "val": 4821.870703071273 },
    { "val": 4826.9039271975125 },
    { "val": 4824.607134818903 },
    { "val": 4810.692226928716 },
    { "val": 4812.295433765962 },
    { "val": 4820.143179294418 },
    { "val": 4819.330013612126 },
    { "val": 4824.18977741691 },
    { "val": 4815.986912689228 },
    { "val": 4820.581483707457 },
    { "val": 4828.446499277646 },
    { "val": 4819.485044117579 },
    { "val": 4819.143685535206 },
    { "val": 4827.174575346358 },
    { "val": 4812.968808050528 },
    { "val": 4811.459552991728 },
    { "val": 4814.616650632676 },
    { "val": 4818.048945623961 },
    { "val": 4829.800721830916 },
    { "val": 4822.499564402418 },
    { "val": 4824.403316344847 },
    { "val": 4814.78447524457 },
    { "val": 4819.473741886631 },
    { "val": 4829.926455270792 },
    { "val": 4811.506204574963 },
    { "val": 4824.551660488378 },
    { "val": 4817.772490422505 },
    { "val": 4817.083202718684 },
    { "val": 4827.527057500709 },
    { "val": 4821.127523692051 },
    { "val": 4818.152029903108 },
    { "val": 4826.337366835757 },
    { "val": 4822.898796643936 },
    { "val": 4811.077298808971 },
    { "val": 4822.203956784367 },
    { "val": 4819.57090420585 },
    { "val": 4821.536552707861 },
    { "val": 4817.645797354114 },
    { "val": 4829.6174485852525 },
    { "val": 4822.973838611604 },
    { "val": 4817.994779227071 },
    { "val": 4814.270358589041 },
    { "val": 4825.167282223935 },
    { "val": 4816.712885270908 },
    { "val": 4824.390784135949 },
    { "val": 4811.672051985881 },
    { "val": 4814.302714198769 },
    { "val": 4810.128053840697 },
    { "val": 4811.230133919437 },
    { "val": 4817.377550771627 },
    { "val": 4820.1924539396405 },
    { "val": 4826.276303630884 },
    { "val": 4813.849177874792 },
    { "val": 4815.626953645064 },
    { "val": 4819.46855519344 },
    { "val": 4821.400669031249 },
    { "val": 4826.233934345067 },
    { "val": 4823.254952244591 },
    { "val": 4819.312295010423 },
    { "val": 4826.064803285076 },
    { "val": 4813.12829498748 },
    { "val": 4816.973896552124 },
    { "val": 4811.970740654784 },
    { "val": 4820.9245904126265 },
    { "val": 4814.396160247463 },
    { "val": 4824.664733720803 },
    { "val": 4826.211361272768 },
    { "val": 4819.22140227807 },
    { "val": 4821.009245781838 },
    { "val": 4820.187932515998 },
    { "val": 4813.183258673601 },
    { "val": 4815.587756248405 },
    { "val": 4812.051611216036 },
    { "val": 4818.4532526477815 },
    { "val": 4817.97173316819 },
    { "val": 4823.054739750082 },
    { "val": 4820.97042562012 },
    { "val": 4812.419409628277 },
    { "val": 4814.232877182772 },
    { "val": 4814.34009554867 },
    { "val": 4818.949442754579 },
    { "val": 4822.89206259697 },
    { "val": 4817.274841864347 },
    { "val": 4822.371594345365 },
    { "val": 4826.204687075067 },
    { "val": 4826.198555528526 },
    { "val": 4818.067730394614 },
    { "val": 4823.933677716959 },
    { "val": 4816.423325686364 },
    { "val": 4812.490203535578 },
    { "val": 4823.018856870426 },
    { "val": 4811.7609490972145 },
    { "val": 4812.204492028331 },
    { "val": 4827.592995919074 },
    { "val": 4811.508507995034 },
    { "val": 4817.746764651455 },
    { "val": 4812.659937900128 },
    { "val": 4816.4433983532535 },
    { "val": 4814.16794015242 },
    { "val": 4829.899946492833 },
    { "val": 4818.958518018284 },
    { "val": 4812.030846615865 },
    { "val": 4827.117334346909 },
    { "val": 4821.201958202777 },
    { "val": 4829.309515313942 },
    { "val": 4812.87035933621 },
    { "val": 4823.896037103004 },
    { "val": 4815.5089563186175 },
    { "val": 4811.608878349434 },
    { "val": 4820.041770550798 },
    { "val": 4821.75247627504 },
    { "val": 4829.565768358265 },
    { "val": 4812.180245857151 },
    { "val": 4820.1728912951085 },
    { "val": 4813.569319804861 },
    { "val": 4817.316097881051 },
    { "val": 4822.968142021599 },
    { "val": 4829.444033591202 },
    { "val": 4810.310630272324 },
    { "val": 4814.4952948597675 }
  ],
  "temp_data": [
    { "val": 9.04401952460937 },
    { "val": 74.44605752532719 },
    { "val": 73.45284001516501 },
    { "val": 73.99878991898942 },
    { "val": 74.70668915768825 },
    { "val": 68.45453031224964 },
    { "val": 70.27494272451277 },
    { "val": 70.43269420467911 },
    { "val": 73.067763224734 },
    { "val": 68.25991570477944 },
    { "val": 75.29154822000396 },
    { "val": 73.63655614370596 },
    { "val": 75.06278683879063 },
    { "val": 75.74527994611758 },
    { "val": 72.26257996320314 },
    { "val": 71.00063407220894 },
    { "val": 73.65946839884012 },
    { "val": 70.83562870995564 },
    { "val": 70.2351273649778 },
    { "val": 75.9795323723524 },
    { "val": 69.96825838853859 },
    { "val": 74.33236358389186 },
    { "val": 73.88818276410578 },
    { "val": 74.86722446769953 },
    { "val": 71.70610828543968 },
    { "val": 73.3502985674711 },
    { "val": 69.4873138753541 },
    { "val": 72.02789770164472 },
    { "val": 72.24066860892026 },
    { "val": 69.75462623691114 },
    { "val": 68.9460171667359 },
    { "val": 69.88458744943054 },
    { "val": 74.96213441786296 },
    { "val": 73.48349051367272 },
    { "val": 74.31928584413942 },
    { "val": 71.59508950169342 },
    { "val": 73.45112219131643 },
    { "val": 72.66556124818081 },
    { "val": 71.77271139356861 },
    { "val": 71.92089609045557 },
    { "val": 75.35600171997264 },
    { "val": 74.2974705306979 },
    { "val": 75.88478900270917 },
    { "val": 69.90372416674484 },
    { "val": 74.04525841691371 },
    { "val": 71.07710440653516 },
    { "val": 68.46067630501574 },
    { "val": 68.60291817728232 },
    { "val": 70.03313941222672 },
    { "val": 69.68040598260065 },
    { "val": 69.21051340202378 },
    { "val": 69.05672268066245 },
    { "val": 70.10978783426677 },
    { "val": 71.95637339159327 },
    { "val": 71.08533856174728 },
    { "val": 68.76743169653984 },
    { "val": 73.83704547910747 },
    { "val": 75.61426808547634 },
    { "val": 69.34326741415367 },
    { "val": 70.78694343734932 },
    { "val": 73.00699534036767 },
    { "val": 75.39584535948424 },
    { "val": 70.51204505984565 },
    { "val": 75.90760819413471 },
    { "val": 75.60982033394139 },
    { "val": 75.99278288502154 },
    { "val": 71.91237238400923 },
    { "val": 74.18761866637153 },
    { "val": 72.0136990451134 },
    { "val": 69.1069615754439 },
    { "val": 71.86553970513481 },
    { "val": 74.61221244215514 },
    { "val": 68.41737949575231 },
    { "val": 74.99965596113283 },
    { "val": 71.17514288777534 },
    { "val": 75.42445298481567 },
    { "val": 75.68579425579544 },
    { "val": 72.81497233160636 },
    { "val": 69.98019689091711 },
    { "val": 68.83375313467346 },
    { "val": 69.17006445554513 },
    { "val": 75.19887577795045 },
    { "val": 72.25457046586554 },
    { "val": 75.65025972777465 },
    { "val": 75.497997878671 },
    { "val": 70.44847187032084 },
    { "val": 68.86781887186436 },
    { "val": 73.69385683896792 },
    { "val": 69.73702062355741 },
    { "val": 69.5788414714597 },
    { "val": 68.07967997712306 },
    { "val": 72.68776405257017 },
    { "val": 75.2084361292644 },
    { "val": 71.25530713857584 },
    { "val": 70.82225881610474 },
    { "val": 69.16252046788784 },
    { "val": 73.89405320435169 },
    { "val": 70.67607950678108 },
    { "val": 75.32501699214065 },
    { "val": 74.5064163825423 },
    { "val": 72.47966957516107 },
    { "val": 68.10402639087513 },
    { "val": 71.3823071356551 },
    { "val": 72.88866012415961 },
    { "val": 73.85678518801909 },
    { "val": 73.33223902187616 },
    { "val": 72.17622077342772 },
    { "val": 73.2246224370365 },
    { "val": 72.51452302375384 },
    { "val": 71.01906082280982 },
    { "val": 70.34840235774911 },
    { "val": 68.97001511201265 },
    { "val": 74.07828683384356 },
    { "val": 70.54287725243432 },
    { "val": 72.93198714762343 },
    { "val": 71.85259547296947 },
    { "val": 75.31338943652757 },
    { "val": 74.1967869748501 },
    { "val": 71.74733347721646 },
    { "val": 71.42401663836677 },
    { "val": 68.90063787798658 },
    { "val": 70.68528200011315 },
    { "val": 72.60783942407534 },
    { "val": 73.61193768538439 },
    { "val": 72.82925021973347 },
    { "val": 73.3320379483818 },
    { "val": 68.04138984191243 },
    { "val": 74.2166134845812 },
    { "val": 71.18750778285617 },
    { "val": 73.3740408503135 },
    { "val": 74.99692592058852 },
    { "val": 70.61204828299319 },
    { "val": 70.47653780989512 },
    { "val": 68.31772630704138 },
    { "val": 75.49556099839631 },
    { "val": 68.24140460545915 },
    { "val": 73.69591814841822 },
    { "val": 71.69286010279038 },
    { "val": 73.70002105040871 },
    { "val": 72.34703472293528 },
    { "val": 68.37788450528244 },
    { "val": 69.1741537398651 },
    { "val": 70.78011682737552 },
    { "val": 72.50019121723177 },
    { "val": 69.17018714033887 },
    { "val": 72.05940849916996 },
    { "val": 70.96265097254079 },
    { "val": 75.45064905012265 },
    { "val": 69.19366286801937 },
    { "val": 72.19624813934544 },
    { "val": 74.16413255520544 },
    { "val": 70.89471443683301 },
    { "val": 69.15881146042553 },
    { "val": 68.15448502424195 },
    { "val": 74.97936964412335 },
    { "val": 74.79120122251724 },
    { "val": 74.27620033136202 },
    { "val": 69.92925363409434 },
    { "val": 71.87718620889925 },
    { "val": 70.954459021881 },
    { "val": 70.6079407640265 },
    { "val": 73.0498950680589 },
    { "val": 75.1663047582779 },
    { "val": 73.45198404280157 },
    { "val": 69.61865873326107 },
    { "val": 69.36431569827086 },
    { "val": 72.32396771776371 },
    { "val": 68.80697081408158 },
    { "val": 68.43820945280515 },
    { "val": 70.06893004219877 },
    { "val": 74.10863676427618 },
    { "val": 74.89967649040074 },
    { "val": 75.42147398698475 },
    { "val": 75.35642249387129 },
    { "val": 75.79351089709829 },
    { "val": 73.46311487963168 },
    { "val": 68.19574635821152 },
    { "val": 72.71474114129536 },
    { "val": 70.02471750409889 },
    { "val": 69.59137580492072 },
    { "val": 75.1076257849759 },
    { "val": 70.8465353086389 },
    { "val": 69.53945671518503 },
    { "val": 72.98340123284599 },
    { "val": 74.76853879563012 },
    { "val": 69.01521187542558 },
    { "val": 74.23517223921299 },
    { "val": 68.4054852041591 },
    { "val": 72.61841930435892 },
    { "val": 73.9337553465027 },
    { "val": 70.3936147591792 },
    { "val": 70.24527487556544 },
    { "val": 74.29342172895298 },
    { "val": 75.32768794967664 },
    { "val": 72.30060380265252 },
    { "val": 75.22303573621944 },
    { "val": 73.2164124382291 },
    { "val": 73.23199804207323 },
    { "val": 68.01705067120703 },
    { "val": 68.97743526586676 },
    { "val": 69.58539677743339 },
    { "val": 72.62532797745585 },
    { "val": 73.51977971530394 },
    { "val": 75.92942939805596 },
    { "val": 73.30401282034691 },
    { "val": 75.39219574578951 },
    { "val": 69.59212425160942 },
    { "val": 68.0833764576579 },
    { "val": 72.6848765260092 },
    { "val": 71.25338381612512 },
    { "val": 70.97092394887636 },
    { "val": 68.8656118727465 },
    { "val": 71.02915322314402 },
    { "val": 71.75272267331783 },
    { "val": 69.98323856302144 },
    { "val": 68.73789857209529 },
    { "val": 70.85879099609869 },
    { "val": 75.12956316417656 },
    { "val": 73.58532096982657 },
    { "val": 72.92515758629152 },
    { "val": 70.50932557710091 },
    { "val": 74.5074484053499 },
    { "val": 72.45668630371588 },
    { "val": 74.97485225612063 },
    { "val": 74.00009616030403 },
    { "val": 70.083895033875 },
    { "val": 72.13556979959928 },
    { "val": 75.55964074668735 },
    { "val": 73.82708744375806 },
    { "val": 72.9906661484433 },
    { "val": 69.04412202645236 },
    { "val": 73.28264241237702 },
    { "val": 72.20390395465071 },
    { "val": 75.8262223116213 },
    { "val": 72.96915189907806 },
    { "val": 69.08740660294092 },
    { "val": 70.37191437620668 },
    { "val": 69.20470967202915 },
    { "val": 68.45957431106225 },
    { "val": 68.29277272183313 },
    { "val": 73.534701813455 },
    { "val": 75.61403905977504 },
    { "val": 74.59581233424996 },
    { "val": 68.98793737876287 },
    { "val": 71.98796263151121 },
    { "val": 69.84769381946822 },
    { "val": 75.61296583922473 },
    { "val": 70.93106296856926 },
    { "val": 75.10928850399839 },
    { "val": 74.9425828040309 },
    { "val": 68.68081941205845 },
    { "val": 71.95450230547762 },
    { "val": 69.0413771451119 },
    { "val": 70.02186782545259 },
    { "val": 73.6937685750114 },
    { "val": 73.25399467302984 },
    { "val": 70.45501758607189 },
    { "val": 68.38281848123083 },
    { "val": 70.15966341289732 },
    { "val": 71.77672108198699 },
    { "val": 68.59942418093733 },
    { "val": 69.87604784300315 },
    { "val": 74.82316113966489 },
    { "val": 71.42622905878582 },
    { "val": 74.54273021937671 },
    { "val": 70.12721811731616 },
    { "val": 71.54514589339806 },
    { "val": 71.0770146228884 },
    { "val": 75.48083579575916 },
    { "val": 69.6570823424831 },
    { "val": 69.99633469472916 },
    { "val": 70.68684156811837 },
    { "val": 74.2736889737474 },
    { "val": 74.58569961169624 },
    { "val": 68.26478716578096 },
    { "val": 73.88792797558249 },
    { "val": 74.75880070368412 },
    { "val": 72.5739368602808 },
    { "val": 68.40255969569556 },
    { "val": 74.10463916568065 },
    { "val": 71.74224799140278 },
    { "val": 68.89542482960532 },
    { "val": 73.04960404888382 },
    { "val": 68.64529271139685 },
    { "val": 75.52796883162598 },
    { "val": 73.90305565532474 },
    { "val": 75.51061899035165 },
    { "val": 68.3446584851841 },
    { "val": 75.94633070281695 },
    { "val": 70.99620960517016 },
    { "val": 70.69472947906236 },
    { "val": 68.79898959702179 },
    { "val": 72.08467976083057 },
    { "val": 71.05471791997442 },
    { "val": 74.76500499598201 },
    { "val": 75.68721009585306 },
    { "val": 73.79373390855031 },
    { "val": 75.38685671447799 },
    { "val": 72.50233435177869 },
    { "val": 68.81372181618954 },
    { "val": 68.82152709320106 },
    { "val": 72.86089597789417 },
    { "val": 74.15574202707032 },
    { "val": 68.99997297043535 },
    { "val": 69.31065396251434 },
    { "val": 72.97216566852785 },
    { "val": 71.4898000184523 },
    { "val": 71.60743200384579 },
    { "val": 72.67973852447204 },
    { "val": 70.1654764812873 },
    { "val": 69.97196527034149 },
    { "val": 68.46388726518116 },
    { "val": 70.07728325446448 },
    { "val": 69.98990622715392 },
    { "val": 70.41036006466061 },
    { "val": 75.938003674731 },
    { "val": 73.78762000480073 },
    { "val": 73.42569517317769 },
    { "val": 75.46017813280578 },
    { "val": 73.42711582714244 },
    { "val": 75.0790258511744 },
    { "val": 71.59582254869633 },
    { "val": 68.38710666522296 },
    { "val": 72.02766325186606 },
    { "val": 69.4587230327198 },
    { "val": 74.59283326240241 },
    { "val": 72.58291177176652 },
    { "val": 70.61033481280056 },
    { "val": 74.63322768392767 },
    { "val": 75.5277148435636 },
    { "val": 70.04235753257048 },
    { "val": 73.03629515496955 },
    { "val": 74.46302686631276 },
    { "val": 70.59470413553625 },
    { "val": 71.04865463452863 },
    { "val": 70.81763909062923 },
    { "val": 74.28957427447928 },
    { "val": 74.72740326598264 },
    { "val": 69.68726257625997 },
    { "val": 72.86331672437778 },
    { "val": 70.07207063185906 },
    { "val": 69.07630283017025 },
    { "val": 70.85392411256728 },
    { "val": 73.1412897993186 },
    { "val": 71.4563661992345 },
    { "val": 71.6665079069994 },
    { "val": 75.82101075888153 },
    { "val": 68.05618101255261 },
    { "val": 68.25352090295738 },
    { "val": 73.10346725385581 },
    { "val": 71.0976586441779 },
    { "val": 69.92528227067785 },
    { "val": 73.76554852697599 },
    { "val": 70.52574209023085 },
    { "val": 70.68255926691566 },
    { "val": 72.42740741469073 },
    { "val": 70.38421313087454 },
    { "val": 69.99080209986803 },
    { "val": 69.32808892343887 },
    { "val": 69.25328169582806 },
    { "val": 75.31810369516751 },
    { "val": 75.0185963459161 },
    { "val": 70.64320194572878 },
    { "val": 69.46480759003153 },
    { "val": 68.88865944556734 },
    { "val": 75.56296324816778 },
    { "val": 68.12562990557537 },
    { "val": 71.16144267339757 },
    { "val": 74.0126305578406 },
    { "val": 74.44996067976724 },
    { "val": 71.73308299682753 },
    { "val": 75.33033751944923 },
    { "val": 68.32412273713697 },
    { "val": 68.03073412148794 },
    { "val": 69.42673715002033 },
    { "val": 74.31476857220152 },
    { "val": 74.9826132038745 },
    { "val": 69.82068500115513 },
    { "val": 72.74647921551046 },
    { "val": 69.1670269836132 },
    { "val": 75.85502588602375 },
    { "val": 75.33301711142894 },
    { "val": 68.76569331727723 },
    { "val": 75.72321021630991 },
    { "val": 74.59968470309137 },
    { "val": 71.01920269688098 },
    { "val": 75.01433601233144 },
    { "val": 74.6806889150282 },
    { "val": 68.64755616786005 },
    { "val": 72.87404854671851 },
    { "val": 71.0535624995992 },
    { "val": 70.6475763629755 },
    { "val": 70.77668058693995 },
    { "val": 68.14873397106673 },
    { "val": 71.34843409110994 },
    { "val": 73.75782369579088 },
    { "val": 69.35569846049646 },
    { "val": 72.98434683720163 },
    { "val": 71.23120833384783 },
    { "val": 73.48438984458251 },
    { "val": 72.78848202555675 },
    { "val": 73.58690268512366 },
    { "val": 71.38420124692321 },
    { "val": 74.54670613394921 },
    { "val": 72.45323987822563 },
    { "val": 73.08060533623537 },
    { "val": 68.66543761530622 },
    { "val": 68.87648626465378 },
    { "val": 71.72292411820753 },
    { "val": 73.95645604350209 },
    { "val": 69.11483053396255 },
    { "val": 73.57739843433266 },
    { "val": 74.01564329074094 },
    { "val": 75.25792576146723 },
    { "val": 69.21936384590683 },
    { "val": 74.80731402761344 },
    { "val": 75.9919780679427 },
    { "val": 74.1905805400898 },
    { "val": 72.01761960822738 },
    { "val": 72.05490318511268 },
    { "val": 71.36712202340276 },
    { "val": 73.29156068653374 },
    { "val": 69.21316583658277 },
    { "val": 71.5785318738343 },
    { "val": 71.854381505388 },
    { "val": 68.34494273992668 },
    { "val": 73.60140328345635 },
    { "val": 75.48339806199544 },
    { "val": 68.37875743357506 },
    { "val": 71.68866929422087 },
    { "val": 73.79535750587154 },
    { "val": 68.66472774793404 },
    { "val": 74.7479586822603 },
    { "val": 75.67650943596294 },
    { "val": 72.66646374452083 },
    { "val": 74.55572448087243 },
    { "val": 73.04483935825523 },
    { "val": 68.94349868553807 },
    { "val": 70.15063814099847 },
    { "val": 71.73498458616905 },
    { "val": 72.61403053924887 },
    { "val": 70.75600738230781 },
    { "val": 68.06819964659755 },
    { "val": 70.29031354778631 },
    { "val": 68.51711838526872 },
    { "val": 73.35385843989891 },
    { "val": 72.93784971259527 },
    { "val": 75.01066699480185 },
    { "val": 72.2535122207939 },
    { "val": 69.58580089766697 },
    { "val": 68.0495091412853 },
    { "val": 71.78284005313148 },
    { "val": 71.83960262514196 },
    { "val": 75.35359984554565 },
    { "val": 73.7948346016369 },
    { "val": 70.30134325860462 },
    { "val": 68.172130300432 },
    { "val": 70.89074485395312 },
    { "val": 69.71926607074117 },
    { "val": 75.65794599435603 },
    { "val": 71.7457512462565 },
    { "val": 72.8914630429559 },
    { "val": 69.35946313400626 },
    { "val": 72.84620519261344 },
    { "val": 74.56622842233826 },
    { "val": 69.11905449435245 },
    { "val": 70.14453032534864 },
    { "val": 71.52838936975786 },
    { "val": 75.04681110669263 },
    { "val": 69.56357067612322 },
    { "val": 68.17042773737779 },
    { "val": 73.83727243126442 },
    { "val": 69.32876091050105 },
    { "val": 74.90068633621087 },
    { "val": 74.97192603655033 },
    { "val": 71.42096025387211 },
    { "val": 71.45824199350079 },
    { "val": 74.25932335493327 },
    { "val": 72.2672815245997 },
    { "val": 73.88693011767381 },
    { "val": 70.85704963769177 },
    { "val": 71.19506289647607 },
    { "val": 72.16706715289025 },
    { "val": 71.24104724354048 },
    { "val": 72.57453014381412 },
    { "val": 72.74777139799606 },
    { "val": 75.40082946374231 },
    { "val": 75.69485613694141 },
    { "val": 71.79820456046211 },
    { "val": 69.16066336489831 },
    { "val": 68.05503157297886 },
    { "val": 71.33970845981608 },
    { "val": 72.26099455169063 },
    { "val": 68.97915211681763 },
    { "val": 71.52739679128891 },
    { "val": 74.66729231277793 },
    { "val": 70.58510684442224 },
    { "val": 72.98986534349027 },
    { "val": 69.1773935373126 },
    { "val": 74.75798103918329 }
  ]
}