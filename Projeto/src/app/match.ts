import { MessageEvent, WebSocket } from "ws";
import { Round } from "./round";
import { WS_MSG } from "./ws_msg";


export interface MatchConfig {

    show_options: boolean;
    min_amount_players: number;
    max_amount_players: number;
    wait_to_start_time:number;
    msg_status_interval:number;

}


export interface Match {

    key: string;
    name: string;
    config: MatchConfig;
    rounds: Round[];
    Keyplayer_score_map: Map<string, number>
    Keyplayer_name_map: Map<string, string>

}

export class WS_Match {

    match: Match;
    isMatchRunning: boolean = false;
    isOpenRegistry: boolean = true;

    round_timeoutId: NodeJS.Timeout | undefined = undefined;
    wait_intervalId: NodeJS.Timer | undefined = undefined;

    socket: WebSocket | undefined = undefined;

    constructor(match: Match, wss_ip?: string, port?: number) {
        this.match = match;
        if(wss_ip !== undefined && port !== undefined){
            this.launch(wss_ip, port);
        }
    }


    private control(msg_obj: WS_MSG) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;
        const msg_content = msg_obj.msg_content;

        if (receiver === this.match.key && sender !== undefined) {

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
                        this.match.Keyplayer_score_map.set(sender, 0);
                        this.match.Keyplayer_name_map.set(sender, msg_content.username);
                    }
                    break;
                case "unregistry_player":
                    if (sender !== undefined) {
                        this.match.Keyplayer_score_map.delete(sender);
                        this.match.Keyplayer_name_map.delete(sender);
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


    start() {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.isMatchRunning = false;
            this.isOpenRegistry = true;

            var self = this;
            // status msg: agd min amount 
            this.wait_intervalId = setInterval(() => {

                self.socket?.send(
                    JSON.stringify({
                        sender: self.match.key,
                        sender_cluster: self.match.key,
                        receiver: "__cluster__",
                        receiver_cluster: self.match.key,
                        msg_type: "wait_min_amount_players",
                        msg_content: {}
                    }));

            }, self.match.config.msg_status_interval);

            setTimeout(()=>{

                if( !self.isMatchRunning && 
                    self.match.Keyplayer_score_map.size <  self.match.config.min_amount_players){

                        self.end("no min amount players");

                }

            }, self.match.config.wait_to_start_time)

        }

    }


    launch(wss_ip: string, port: number) {

        this.end();

        this.socket = new WebSocket('ws://' + wss_ip + ':' + port.toString() + '/');

        var self = this;

        this.socket.onopen = function (event) {

            if (self.socket !== undefined) {

                self.socket.onmessage = function (event: MessageEvent) {

                    console.log('Match control websocket(' + self.match.key + ') received message: ' + event.data.toString());

                    self.control(JSON.parse(event.data.toString()) as WS_MSG);

                };

                self.socket.onerror = function (error) {

                    console.log('Match control websocket(' + self.match.key + ') error: ' + error);

                };

                self.socket.onclose = function (event) { 

                    console.log('Match control websocket(' + self.match.key + ') closed.');
                };

                self.start();

            };

        }
    }

    end(info?:string) {

        if (this.socket !== undefined) {

            this.socket.send(
                JSON.stringify({
                    sender: this.match.key,
                    sender_cluster: this.match.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.match.key,
                    msg_type: "match_end",
                    msg_content: {
                        info: info
                    }
                }));

            var self = this;

            setTimeout(()=>{

                self.socket?.close(1000);

            },2000);

            

        }

    }


}


const match:Match = {
    key: "",
    name: "",
    config: {
        show_options: false,
        min_amount_players: 0,
        max_amount_players: 0,
        wait_to_start_time: 0,
        msg_status_interval: 0
    },
    rounds: [],
    Keyplayer_score_map: new Map(),
    Keyplayer_name_map: new Map()
}

