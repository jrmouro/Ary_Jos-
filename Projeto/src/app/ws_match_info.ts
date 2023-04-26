import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Protocol } from "./protocol";
import { MatchStatus } from "./match_status";

interface MatchInfo{
    name:string;
    key:string;
    status:string;
}

export class WS_MatchInfo {

    key: string;
    port: number | undefined;
    socket: WebSocket | undefined = undefined;

    matchesInfo: {[key:string]: MatchInfo} = {};

    eventCallback:(event:string, matchInfo:WS_MatchInfo)=>void;

    constructor(key:string, eventCallback:(event:string, matchInfo:WS_MatchInfo)=>void, wss_ip?: string, port?: number) {
        this.key = key;
        this.eventCallback = eventCallback;
        if (wss_ip !== undefined && port !== undefined) {
            this.launch(wss_ip, port);
        }
    }


    close(info?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.close(1000, info);

        }

    }

    
    info(matchinfo:MatchInfo){

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            if(matchinfo.status === MatchStatus.finished){

                delete this.matchesInfo[matchinfo.key];

            } else {

                this.matchesInfo[matchinfo.key] = matchinfo;

            }

            const msg_obj:WS_MSG = {
                sender: this.key,
                sender_cluster: this.key,
                receiver: "__cluster__",
                receiver_cluster: this.key,
                msg_type: Protocol.match_info,
                msg_content: matchinfo
            }

            this.socket.send(JSON.stringify(msg_obj));

        }

    }

    private control(msg_obj: WS_MSG) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;
        const msg_content = msg_obj.msg_content;

        if (receiver === this.key && sender !== undefined) {

            switch (msg_type) {

                case Protocol.match_info_get_status:
                    // this.register(sender);
                    break;

                case Protocol.match_info_set_status:
                    // this.register(sender);
                    break;
                                
            }

        }

    }

    launch(wss_ip: string, port: number) {

        this.port = port;

        this.socket = new WebSocket('ws://' + wss_ip + ':' + port.toString() + '/');

        var self = this;

        this.socket.onopen = function (event) {

            if (self.socket !== undefined) {

                self.socket.onmessage = function (event: MessageEvent) {

                    console.log('MatchInfo control websocket(' + self.key + ') received message: ' + event.data.toString());

                    self.control(JSON.parse(event.data.toString()) as WS_MSG);

                };

                self.socket.onerror = function (error) {

                    console.log('MatchInfo control websocket(' + self.key + ') error: ' + error);

                    self.eventCallback("error", self);

                };

                self.socket.onclose = function (event) {

                    console.log('MatchInfo control websocket(' + self.key + ') closed.');

                    self.eventCallback("close", self);

                };

                self.eventCallback("open", self);

            };
        }

        self.eventCallback("launch", self);

    }

   

}




// const ws_match_info = new WS_MatchInfo("m1",(ev:string)=>{}, "localhost", 5555);
