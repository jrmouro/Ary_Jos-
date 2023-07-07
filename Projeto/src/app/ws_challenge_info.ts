import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Protocol } from "./protocol";
import { Player } from "./player";
import { ChallengeStatus } from "./challenge_status";

interface ChallengeInfo{
    name:string;
    key:string;
    status:string;
    owner_user_key:string;
    players: { [key: string]: Player };

}

export class WS_ChallengeInfo {

    key: string;
    port: number | undefined;
    private socket: WebSocket | undefined = undefined;

    private challengesInfo: {[key:string]: ChallengeInfo} = {};

    eventCallback:(event:string, challengeInfo:WS_ChallengeInfo)=>void;

    constructor(
        key:string, 
        eventCallback:(event:string, challengeInfo:WS_ChallengeInfo)=>void, 
        wss_ip?: string,
        port?: number) {
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

    
    setInfo(challengeinfo:ChallengeInfo){

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            if(challengeinfo.status === ChallengeStatus.aborted){

                delete this.challengesInfo[challengeinfo.key];

            } else {

                this.challengesInfo[challengeinfo.key] = challengeinfo;

            }

            const msg_obj:WS_MSG = {
                sender: this.key,
                sender_cluster: this.key,
                receiver: "__cluster__",
                receiver_cluster: this.key,
                msg_type: Protocol.challenge_info,
                msg_content: this.challengesInfo
            }

            this.socket.send(JSON.stringify(msg_obj));

        }

    }

    private control(msg_obj: WS_MSG) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;

        console.log(JSON.stringify(msg_obj));

        if (receiver === this.key && sender !== undefined) {

            switch (msg_type) {

                case Protocol.challenge_info:
        
                    this.socket?.send(JSON.stringify(                        
                        {
                            sender: this.key,
                            sender_cluster: this.key,
                            receiver: sender,
                            receiver_cluster: this.key,
                            msg_type: Protocol.challenge_info,
                            msg_content: this.challengesInfo
                        }
                    ));

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

                    self.control(JSON.parse(event.data.toString()) as WS_MSG);

                };

                self.socket.onerror = function (error) {

                    console.log('ChallengeInfo control websocket(' + self.key + ') error: ' + error);

                    self.eventCallback("error", self);

                };

                self.socket.onclose = function (event) {

                    console.log('ChallengeInfo control websocket(' + self.key + ') closed.');

                    self.eventCallback("close", self);

                };

                const msg_obj:WS_MSG = {
                    sender: self.key,
                    sender_cluster: self.key,
                    receiver: "__server__",
                    receiver_cluster: self.key,
                    msg_type: Protocol.wss_client_register,
                    msg_content: {}
                }
    
                self.socket.send(JSON.stringify(msg_obj));

                self.eventCallback("open", self);

            };
        }

        self.eventCallback("launch", self);

    }

   

}

