import express, { query } from 'express'
import { Router, Request, Response } from 'express';
import IP from "ip";
import { WSS, WSS_Event, WSS_EventType } from './wss';

const app = express();

const route = Router()

app.use(express.static('public'));
app.use(express.json())

app.set('view engine', 'ejs');

// var wssp = 7777;
// var ws_cluster = Date.now().toString(36) + Math.random().toString(36).substr(2);

// var wss = new WSS((ev: WSS_Event, wss: WSS) => {

//   console.log(`wss at port ${wss.port} event: ${JSON.stringify(ev)}`);

//   if (ev.type === WSS_EventType.client_disconnected) {

//     wss.broadcast_cluster(ws_cluster, {
//       sender: ev.key,
//       sender_cluster: ws_cluster,
//       receiver: ws_cluster,
//       receiver_cluster: ws_cluster,
//       msg_type: '2',
//       msg_content: undefined
//     }, false);


//   }

// }, wssp);



route.get('/', function (req, res) {

  const ws_client = Date.now().toString(36) + Math.random().toString(36).substr(2);

  res.render('sketch', {

    wssa: req.query.wssa,
    wssp: req.query.wssp,
    ws_client: req.query.ws_client,
    ws_cluster: req.query.ws_cluster

  });

});

app.use(route)

var wsp = 8888;
var webserver = app.listen(wsp, () => {
  console.log(`ws at : http://localhost:${wsp}/`);
});

for (let signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    console.info(`${signal} signal received.`);
    console.log("Closing http server.");
    webserver.close((err) => {
      console.log("Http server closed.");
      process.exit(err ? 1 : 0);
    });
    // wss.close();
  });
