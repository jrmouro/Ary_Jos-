import { WebSocket, WebSocketServer } from "ws";
import { WS_MSG } from "./ws_msg";

export enum WSS_EventType{
    client_connected,
    client_disconnected,
    client_mapped,
    client_clustered,
    server_openned,
    server_closed,
}

export interface WSS_Event{
    type:WSS_EventType;
    key:string | undefined;
}


export class WSS {
    
    private wsclient_userkey_map:  Map<WebSocket, string> = new Map();
    private userkey_wsclient_map: Map<string, WebSocket> = new Map();
    private clusterkey_wsclientset_map: Map<string, Set<WebSocket>> = new Map();
    private wsclient_clusterkey_map: Map<WebSocket,string> = new Map();
    private websocketserver: WebSocketServer | undefined = undefined;
    port:number | undefined;
    
    eventCallback:(event:WSS_Event, wss:WSS)=>void;

    constructor(eventCallback:(event:WSS_Event, wss:WSS)=>void, port?:number){
        this.eventCallback = eventCallback;
        this.port = port;
        if(this.port !== undefined){
            this.launch(this.port);
        }
        
    }


    broadcast(msgObj: any, isBinary: boolean) {

        this.websocketserver?.clients.forEach(function each(client: WebSocket) {

            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(msgObj), {
                    binary: isBinary
                });
            }

        });

    }

    broadcast_cluster(groupkey: string, msgObj: any, isBinary: boolean) {

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

        this.port = port;
        
        this.websocketserver = new WebSocketServer({ port: port });

        var self = this;

        this.websocketserver.on('connection', function connection(ws, req) {

            ws.on('message', function message(data, isBinary) {

                // console.log("==============wss message = " + data);

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

                    self.eventCallback({
                        type: WSS_EventType.client_disconnected,
                        key: client_key
                    }, self);

                }

                

            });

            self.eventCallback({
                type: WSS_EventType.client_connected,
                key: undefined
            }, self);            

        });

        this.eventCallback({
            type: WSS_EventType.server_openned,
            key: undefined
        }, this);

    }

    close() {

        this.websocketserver?.close();
        this.websocketserver = undefined;
        this.userkey_wsclient_map.clear();
        this.wsclient_userkey_map.clear();
        this.clusterkey_wsclientset_map.clear();
        this.wsclient_clusterkey_map.clear();

        this.eventCallback({
            type: WSS_EventType.server_closed,
            key: undefined
        }, this);

    }

}

// const server =  new WSS((ev:string, wss:WSS)=>{

//     console.log(`wss at port ${wss.port} event: ${ev}`);
    
// }, 5000);