import { Match } from "./match";
import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Player } from "./player";
import { Protocol } from "./protocol";

export class WS_Player {

    player:Player;
    matchkey:string;

    registry: { matchkey:string, matchname: string } | undefined = undefined;

    socket: WebSocket | undefined = undefined;

    constructor(player:Player, matchkey:string, wss_ip?: string, port?: number) {
        this.player = player;
        this.matchkey = matchkey;
        if (wss_ip !== undefined && port !== undefined) {
            this.launch(wss_ip, port);
        }
    }


    private control(msg_obj: WS_MSG) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;
        const msg_content = msg_obj.msg_content;

        if (receiver === this.player.key && sender !== undefined) {

            switch (msg_type) {

                //status
                case "wait_min_amount_players":
                    break;
                case "max_amount_players":
                    break;
                case "match_end":
                    break;

                //registry
                case "registry_player":
                    if (sender !== undefined && msg_content !== undefined) {

                    }
                    break;
                case "unregistry_player":
                    if (sender !== undefined) {

                    }
                    break;

                //round
                case "round_shot":
                    break;
                case "round_start":
                    break;
                case "round_end":
                    break;
            }

        }

    }


    start(info?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.player.key,
                    sender_cluster: this.matchkey,
                    receiver: "__cluster__",
                    receiver_cluster: this.matchkey,
                    msg_type: Protocol.match_registry,
                    msg_content: {
                        playername: this.player.name
                    }
                }));   
                
                var self = this;

            setTimeout(() => {

                if (self.registry === undefined) {

                    self.end("no registry");

                }

            }, self.player.config.wait_to_start_time);


        }

    }

    


    launch(wss_ip: string, port: number) {

        this.end();

        this.socket = new WebSocket('ws://' + wss_ip + ':' + port.toString() + '/');

        var self = this;

        this.socket.onopen = function (event) {

            if (self.socket !== undefined) {

                self.socket.onmessage = function (event: MessageEvent) {

                    console.log('Player control websocket(' + self.player.key + ') received message: ' + event.data.toString());

                    self.control(JSON.parse(event.data.toString()) as WS_MSG);

                };

                self.socket.onerror = function (error) {

                    console.log('Player control websocket(' + self.player.key + ') error: ' + error);

                };

                self.socket.onclose = function (event) {

                    console.log('Player control websocket(' + self.player.key + ') closed.');
                };

                self.start();

            };
        }
    }

    end(info?: string) {

        if (this.socket !== undefined) {

            this.socket.send(
                JSON.stringify({
                    sender: this.player.key,
                    sender_cluster: this.matchkey,
                    receiver: "__cluster__",
                    receiver_cluster: this.matchkey,
                    msg_type:Protocol.player_end,
                    msg_content: {
                        info: info
                    }
                }));

            var self = this;

            setTimeout(() => {

                self.socket?.close(1000);

            }, 2000);

        }

    }


}


const player1:Player = {
    key: "p1",
    name: "player1",
    config: {
        wait_to_start_time: 30000
    },
    scores: []
}

const ws_player1 = new WS_Player(player1,"m1", "localhost", 5555);
