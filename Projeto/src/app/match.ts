import { MessageEvent, WebSocket, WebSocketServer } from "ws";


export interface MatchConfig {

    show_options: boolean;

}

export interface Round {

    key: string;
    quiz_key: string;
    question_key: string;
    time: number;
    score: Number;

}

export interface Match {

    key: string;
    name: string;
    config: MatchConfig;
    rounds: Round[];
    Keyplayer_score_map: Map<string, number>
    isMatchRunning: boolean;
    isOpenRegistry: boolean;

}

export class WS_Match_Control implements Match {

    key: string;
    name: string;
    isMatchRunning: boolean;
    isOpenRegistry: boolean;
    config: MatchConfig;
    rounds: Round[];
    round_timeoutId: NodeJS.Timeout | undefined = undefined;
    Keyplayer_score_map: Map<string, number> = new Map();
    keyplayer_ws_map: Map<string, WebSocket> = new Map();
    ws_keyplayer_map: Map<WebSocket, string> = new Map();

    socket: WebSocket | undefined = undefined;
    wss_port: number | undefined = undefined;
    wss_ip: string | undefined = undefined;

    constructor(
        key: string,
        name: string,
        config: MatchConfig,
        wss_ip: string | undefined = undefined,
        wss_port: number | undefined = undefined,
        isOpenRegistry: boolean = true, // true-> accept registrations
        rounds: Round[] = []) {
        this.key = key;
        this.name = name;
        this.wss_port = wss_port;
        this.wss_ip = wss_ip;
        this.isMatchRunning = false;
        this.isOpenRegistry = isOpenRegistry;
        this.config = config;
        this.rounds = rounds;

        if (this.wss_ip !== undefined && this.wss_port !== undefined) {
            this.launch(this.wss_ip, this.wss_port);
        }

    }

    control(msg_obj: any) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;
        const msg_content = msg_obj.msg_content;

        if (receiver === key && sender !== undefined) {

            switch (msg_type) {
                case "registry":
                    if (sender !== undefined) self.Keyplayer_score_map.set(sender, 0);
                    break;
                case "unregistry":
                    if (sender !== undefined) self.Keyplayer_score_map.delete(sender);
                    break;
                case "match_shot":
                    break;
            }

        }

    }


    next_round(index: number) {

        //send next_rount

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN && index < this.rounds.length) {

            this.socket?.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: "next_round",
                    msg_content: {
                        index_round: index,
                        round: this.rounds[index],
                    }
                }));

            var self = this;

            this.round_timeoutId = setTimeout(function () {

                self.socket?.send(
                    JSON.stringify({
                        sender: self.key,
                        sender_cluster: self.key,
                        receiver: "__cluster__",
                        receiver_cluster: self.key,
                        msg_type: "end_round",
                        msg_content: {
                            index_round: index,
                            round: self.rounds[index],
                        }
                    }));

            }, this.rounds[index].time);

        }

    }


    start() {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            let index_round = 0;
            var self = this;

            let func = function (rounds: Round[], index: number) {

                //send

                if (index + 1 < rounds.length)

                    setTimeout(func, self.rounds[index + 1].time, self.rounds, index + 1);

            }

            if (this.rounds.length > 0)

                setTimeout(func, this.rounds[0].time, this.rounds, 0);

        }

    }


    launch(wss_ip: string, port: number) {

        this.end();

        this.socket = new WebSocket('ws://' + this.wss_ip + ':' + this.wss_port?.toString() + '/');

        var self = this;
        var socket = this.socket;
        var key = this.key;

        socket.onopen = function (event) {

            socket.onmessage = function (event: MessageEvent) {

                const msg_obj = JSON.parse(event.data.toString());

                self.control(msg_obj);




            };

            socket.onerror = function (error) {

                console.log('Match control websocket(' + key + ') error: ' + error);

            };

            //Mostrando a mensagem de desconectado quando o websocket for fechado.
            socket.onclose = function (event) {
            };


            socket.send(
                JSON.stringify({
                    sender: key
                }));

        };

    }

    end() {

        this.wss_port = undefined;
        this.wss_ip = undefined;

        this.keyplayer_ws_map.clear();
        this.Keyplayer_score_map.clear();
        this.ws_keyplayer_map.clear();

        if (this.socket !== undefined) {

            this.socket.close(1000);

        }

    }


}

