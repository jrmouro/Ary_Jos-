import { WebSocket, WebSocketServer } from "ws";
import { WS_MSG } from "./ws_msg";


export class WSS {
    
    private wsclient_userkey_map:  Map<WebSocket, string> = new Map();
    private userkey_wsclient_map: Map<string, WebSocket> = new Map();
    private clusterkey_wsclientset_map: Map<string, Set<WebSocket>> = new Map();
    private wsclient_clusterkey_map: Map<WebSocket,string> = new Map();
    private wss: WebSocketServer | undefined = undefined;
    port:number | undefined;

    constructor(port?:number){
        
        this.port = port;
        if(this.port !== undefined){
            this.launch(this.port);
        }
        
    }


    private broadcast(msgObj: any, isBinary: boolean) {

        this.wss?.clients.forEach(function each(client: WebSocket) {

            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(msgObj), {
                    binary: isBinary
                });
            }

        });

    }

    private broadcast_cluster(groupkey: string, msgObj: any, isBinary: boolean) {

        const grpou = this.clusterkey_wsclientset_map.get(groupkey);

        if(grpou !== undefined){

            grpou.forEach(function each(client:WebSocket){

                if (client.readyState === WebSocket.OPEN) {

                    client.send(JSON.stringify(msgObj), {
                        binary: isBinary
                    });

                }

            });

        }

    }
   

    launch(port: number) {

        this.wss = new WebSocketServer({ port: port });

        var self = this;

        this.wss.on('connection', function connection(ws, req) {

            ws.on('message', function message(data, isBinary) {

                console.log("message = " + data);

                const ws_msg:WS_MSG = JSON.parse(data.toString()) as WS_MSG;

                if(ws_msg.sender !== undefined){
                    self.userkey_wsclient_map.set(ws_msg.sender, ws);
                    self.wsclient_userkey_map.set(ws,ws_msg.sender);
                }

                if(ws_msg.sender_cluster !== undefined){
                    if(!self.clusterkey_wsclientset_map.has(ws_msg.sender_cluster)){
                        self.clusterkey_wsclientset_map.set(ws_msg.sender_cluster, new Set());
                    }
                    self.clusterkey_wsclientset_map.get(ws_msg.sender_cluster)?.add(ws);
                    self.wsclient_clusterkey_map.set(ws,ws_msg.sender_cluster);
                }

                if (ws_msg.receiver === '__broadcast__') {

                    self.broadcast(ws_msg, isBinary);

                } else if (ws_msg.receiver === '__cluster__' && ws_msg.receiver_cluster !== undefined) {

                    self.broadcast_cluster(ws_msg.receiver_cluster, ws_msg, isBinary);

                } else if ( ws_msg.receiver!== undefined && self.userkey_wsclient_map.has(ws_msg.receiver)) {

                    const ws_receiver = self.userkey_wsclient_map.get(ws_msg.receiver);

                    if (ws_receiver?.readyState === WebSocket.OPEN) {

                        ws_receiver?.send(JSON.stringify(ws_msg), {
                            binary: isBinary
                        });

                    }

                }

            });

            ws.on('close', function (code, reason) {

                if (self.wsclient_userkey_map.has(ws)) {
                    const client_key = self.wsclient_userkey_map.get(ws);
                    if(client_key !== undefined)
                        self.userkey_wsclient_map.delete(client_key);
                    self.wsclient_userkey_map.delete(ws);
                }

            });

        });

    }

    close() {

        this.wss?.close();
        this.wss = undefined;
        this.userkey_wsclient_map.clear();
        this.wsclient_userkey_map.clear();
        this.clusterkey_wsclientset_map.clear();
        this.wsclient_clusterkey_map.clear();

    }

}

const server =  new WSS(5555);