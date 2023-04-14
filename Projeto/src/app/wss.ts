import { WebSocket, WebSocketServer } from "ws";


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


    broadcast(msgObj: any, isBinary: boolean) {

        this.wss?.clients.forEach(function each(client: WebSocket) {

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

        this.wss = new WebSocketServer({ port: port });

        var self = this;

        this.wss.on('connection', function connection(ws, req) {

            ws.on('message', function message(data, isBinary) {

                console.log("message = " + data);

                const msgObj = JSON.parse(data.toString());

                const sender: string | undefined = msgObj.sender;
                const sender_cluster: string  | undefined = msgObj.sender_cluster;
                const receiver: string  | undefined = msgObj.receiver;
                const receiver_cluster: string  | undefined = msgObj.receiver_cluster;
                const msg_type: string  | undefined = msgObj.type;
                const msg_content: any  | undefined = msgObj.content;

                if(sender !== undefined){
                    self.userkey_wsclient_map.set(sender, ws);
                    self.wsclient_userkey_map.set(ws,sender);
                }

                if(sender_cluster !== undefined){
                    if(!self.clusterkey_wsclientset_map.has(sender_cluster)){
                        self.clusterkey_wsclientset_map.set(sender_cluster, new Set());
                    }
                    self.clusterkey_wsclientset_map.get(sender_cluster)?.add(ws);
                    self.wsclient_clusterkey_map.set(ws,sender_cluster);
                }

                if (receiver === '__broadcast__') {

                    self.broadcast(msgObj, isBinary);

                } else if (receiver === '__cluster__' && receiver_cluster !== undefined) {

                    self.broadcast_cluster(receiver_cluster, msgObj, isBinary);

                } else if ( receiver!== undefined && self.userkey_wsclient_map.has(receiver)) {

                    const ws_receiver = self.userkey_wsclient_map.get(receiver);

                    if (ws_receiver?.readyState === WebSocket.OPEN) {

                        ws_receiver?.send(JSON.stringify(msgObj), {
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