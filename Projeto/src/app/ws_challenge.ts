import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Protocol } from "./protocol";
import { Player } from "./player";
import { Round } from "./round";
import { Challenge } from "./challenge";
import { ChallengeStatus } from "./challenge_status";


export class WS_Challenge {

    key: string;
    owner_user_key: string;
    challenge: Challenge;
    players: { [key: string]: Player } = {};
    socket: WebSocket | undefined = undefined;
    eventCallback: (event: string, wschallenge: WS_Challenge) => void;

    constructor(
        key: string,
        owner_user_key: string,
        challenge: Challenge,
        eventCallback: (event: string, wschallenge: WS_Challenge) => void, 
        wss_ip?: string, 
        port?: number) {

        this.key = key;
        this.owner_user_key = owner_user_key;
        this.challenge = challenge;
        this.eventCallback = eventCallback;

        if (wss_ip !== undefined && port !== undefined) {

            this.launch(wss_ip, port);

        }
    }

    private control(msg_obj: WS_MSG) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;

        if (receiver === this.key && sender !== undefined && sender !== this.key) {

            switch (msg_type) {

                case Protocol.challenge_info:

                    this.socket!.send(
                        JSON.stringify({
                            sender: this.key,
                            sender_cluster: this.key,
                            receiver:  sender || "__cluster__",
                            receiver_clureceiverster: this.key,
                            msg_type: Protocol.challenge_info,
                            msg_content: {

                                rounds: this.challenge.rounds

                            }

                        }));

                    break;

            }

        }

    }
    
    abort(info?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.close(1000, info);

        }

        this.eventCallback(ChallengeStatus.aborted, this);

    }

    launch(wss_ip: string, port: number) {

        this.socket = new WebSocket('ws://' + wss_ip + ':' + port.toString() + '/');

        var self = this;

        this.socket.onopen = function (event) {

            self.eventCallback(ChallengeStatus.opened_socket, self);

            if (self.socket !== undefined) {

                self.socket.onmessage = function (event: MessageEvent) {

                    console.log('Challenge control websocket(' + self.key + ') onmessage: ' + event.data.toString());

                    self.control(JSON.parse(event.data.toString()) as WS_MSG);

                };

                self.socket.onerror = function (error) {

                    self.eventCallback(ChallengeStatus.error_socket, self);

                    console.log('Challenge control websocket(' + self.key + ') error: ' + error);

                };

                self.socket.onclose = function (event) {

                    self.eventCallback(ChallengeStatus.closed_socket, self);

                    console.log('Challenge control websocket(' + self.key + ') closed.');

                };

                self.socket.send(
                    JSON.stringify({
                        sender: self.key,
                        sender_cluster: self.key,
                        receiver: "__server__",
                        receiver_cluster: self.key,
                        msg_type: Protocol.challenge_info,
                        msg_content: {}
                    }));

                self.eventCallback(ChallengeStatus.launched, self);

                console.log('Challenge control websocket(' + self.key + ') launched.');

            };

            self.eventCallback(ChallengeStatus.opened_socket, self);

        }


    }

}

