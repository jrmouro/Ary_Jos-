import { Match } from "./match";
import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Protocol } from "./protocol";
import { MatchStatus } from "./match_status";
import { Player } from "./player";

export class WS_Match {

    key: string;
    owner_user_key: string;
    match: Match;

    players: { [key: string]: Player } = {};

    isRunning: boolean = false;
    isOpenToRegistry: boolean = true;
    isRoundShooting: boolean = false;
    roundIndex: number = -1;

    round_timeoutId: NodeJS.Timeout | undefined = undefined;
    shooting_timeoutId: NodeJS.Timeout | undefined = undefined;
    wait_to_start_intervalId: NodeJS.Timer | undefined = undefined;
    wait_to_registry_intervalId: NodeJS.Timer | undefined = undefined;

    socket: WebSocket | undefined = undefined;

    eventCallback: (event: string, wsmatch: WS_Match) => void;

    constructor(key: string, owner_user_key: string, match: Match, eventCallback: (event: string, wsmatch: WS_Match) => void, wss_ip?: string, port?: number) {
        this.key = key;
        this.owner_user_key = owner_user_key;
        this.match = match;
        this.eventCallback = eventCallback;
        if (wss_ip !== undefined && port !== undefined) {
            this.launch(wss_ip, port);
        }
    }


    private control(msg_obj: WS_MSG) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;
        const msg_content = msg_obj.msg_content;

        if (receiver === this.key && sender !== undefined && sender !== this.key) {

            switch (msg_type) {

                //round
                case Protocol.match_shot_pass:

                    break;

                case Protocol.match_shot_response:


                    break;

                // player
                case Protocol.match_shooting:

                    this.shooting(sender);

                    break;


            }

        }

    }

    wait_to_round_resume(sender: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {


            var self = this;

            setTimeout(() => {

                if (self.isRoundShooting) {

                    self.isRoundShooting = false;

                    self.socket?.send( // Verificar se é o caso
                        JSON.stringify({
                            sender: this.key,
                            sender_cluster: this.key,
                            receiver: "__cluster__",
                            receiver_cluster: this.key,
                            msg_type: Protocol.match_wait_to_round_resume,
                            msg_content: {}
                        }));

                    setTimeout(() => {

                        self.round();

                    }, 1000);

                }

            }, this.match.config.wait_to_round_resume_time);

        }

    }

    round_resume(sender: string, msg_content?: {}) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.round_resume,
                    msg_content: {
                        player: sender
                    }
                }));

            var self = this

            setTimeout(() => {

                self.wait_to_round_resume(sender);

            }, 1000);

        }

    }

    wait_to_shooting(sender: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.shooting_timeoutId = setTimeout(() => {

                var self = this;

                if (self.isRoundShooting) {

                    self.socket?.send(
                        JSON.stringify({
                            sender: this.key,
                            sender_cluster: this.key,
                            receiver: "__cluster__",
                            receiver_cluster: this.key,
                            msg_type: Protocol.round_end,
                            msg_content: {}
                        }));

                    setTimeout(() => {

                        self.round_resume(sender);

                    }, 1000);

                }

            }, this.match.config.wait_to_shooting_time);

        }

    }

    shooting(sender: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            if (!this.isRoundShooting) {

                this.isRoundShooting = true;

                this.socket.send(
                    JSON.stringify({
                        sender: this.key,
                        sender_cluster: this.key,
                        receiver: "__cluster__",
                        receiver_cluster: this.key,
                        msg_type: Protocol.match_shooting,
                        msg_content: {
                            player: sender
                        }
                    }));

                var self = this;

                setTimeout(() => {

                    self.wait_to_shooting(sender);

                }, 1000);


            }


        }

    }

    unregister(player_key: string): boolean {

        if (player_key in this.players) {

            if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

                delete this.players[player_key];

                this.socket.send(
                    JSON.stringify({
                        sender: this.key,
                        sender_cluster: this.key,
                        receiver: "__cluster__",
                        receiver_cluster: this.key,
                        msg_type: Protocol.player_unregistry_at_match,
                        msg_content: {
                            player_key: player_key
                        }
                    }));

                return true;

            }

        }

        return false;

    }

    register(player: Player): boolean {

        if (this.isOpenToRegistry && Object.keys(this.players).length < this.match.config.max_amount_players) {

            if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

                this.players[player.key] = player;

                this.isOpenToRegistry = Object.keys(this.players).length < this.match.config.max_amount_players;

                this.socket.send(
                    JSON.stringify({
                        sender: this.key,
                        sender_cluster: this.key,
                        receiver: "__cluster__",
                        receiver_cluster: this.key,
                        msg_type: Protocol.player_registry_at_match,
                        msg_content: {
                            player: player
                        }
                    }));

                if (!this.isOpenToRegistry) {

                    if (this.wait_to_registry_intervalId !== undefined) {
                        clearTimeout(this.wait_to_registry_intervalId);
                        this.wait_to_registry_intervalId = undefined;
                    }

                    var self = this;

                    setTimeout(() => {

                        self.wait_to_start();

                    }, 1000);

                }

                return true;

            }

        }

        return false;

    }


    private state(receiver?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: receiver || "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.match_start,
                    msg_content: {
                        isRunning: this.isRunning,
                        isOpenToRegistry: this.isOpenToRegistry,
                        roundIndex: this.roundIndex
                    }
                }));

        }

    }

    abort(info?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.abort_match,
                    msg_content: {
                        info: info
                    }
                }));

        }

        this.prepare();

        this.eventCallback(MatchStatus.aborted, this);

    }

    private failure(receiver?: string, info?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: receiver || "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.match_failure,
                    msg_content: {
                        info: info
                    }
                }));

            this.eventCallback(MatchStatus.failure, this);

        }

    }

    private prepare() {

        if (this.wait_to_start_intervalId !== undefined) {
            clearTimeout(this.wait_to_registry_intervalId);
            this.wait_to_start_intervalId = undefined;
        }

        if (this.wait_to_registry_intervalId !== undefined) {
            clearTimeout(this.wait_to_registry_intervalId);
            this.wait_to_registry_intervalId = undefined;
        }

        if (this.round_timeoutId !== undefined) {
            clearTimeout(this.round_timeoutId);
            this.round_timeoutId = undefined;
        }

        if (this.shooting_timeoutId !== undefined) {
            clearTimeout(this.shooting_timeoutId);
            this.shooting_timeoutId = undefined;
        }

        this.isRunning = false;
        this.isOpenToRegistry = true;
        this.roundIndex = -1;


        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.close(1000);

        }

        this.socket = undefined;

    }

    private round() {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.roundIndex++;

            if (this.roundIndex < this.match.rounds.length) {

                if (this.round_timeoutId !== undefined) {

                    clearTimeout(this.round_timeoutId);

                }

                this.isRoundShooting = false;

                this.socket.send(
                    JSON.stringify({
                        sender: this.key,
                        sender_cluster: this.key,
                        receiver: "__cluster__",
                        receiver_cluster: this.key,
                        msg_type: Protocol.round_start,
                        msg_content: {}
                    }));

                var self = this;

                this.round_timeoutId = setTimeout(() => {

                    if (self.isRunning && !self.isOpenToRegistry) {

                        self.socket?.send(
                            JSON.stringify({
                                sender: this.key,
                                sender_cluster: this.key,
                                receiver: "__cluster__",
                                receiver_cluster: this.key,
                                msg_type: Protocol.round_end,
                                msg_content: {}
                            }));

                        setTimeout(() => {

                            self.round();

                        }, 1000);

                    }

                }, self.match.rounds[this.roundIndex].response_timeout);

            } else {

                this.end();

            }

        }

    }

    private start() {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.isRunning = true;

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.match_start,
                    msg_content: {}
                }));

            var self = this;

            this.eventCallback(MatchStatus.started, self);

            setTimeout(() => {

                self.round();

            }, 1000);

        }

    }

    private wait_to_start() {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.wait_to_start_match,
                    msg_content: {}
                }));

            var self = this;

            this.wait_to_start_intervalId = setTimeout(() => {

                if (!self.isRunning && !self.isOpenToRegistry) {

                    self.start();

                }

            }, self.match.config.wait_to_start_match_time);

            self.eventCallback(MatchStatus.wait_to_start, self);

        }

    }

    private wait_to_registry() {

        var self = this;

        this.wait_to_registry_intervalId = setTimeout(() => {

            if (!self.isRunning && self.isOpenToRegistry) {

                if (Object.keys(this.players).length < self.match.config.min_amount_players) {

                    self.failure(undefined, "no min amount players");

                    self.abort("no min amount players");

                    return;

                } else {

                    self.isOpenToRegistry = false;

                    self.wait_to_start();

                }

            }

        }, self.match.config.wait_to_registry_at_match_time);

        self.eventCallback(MatchStatus.wait_to_registry, self);

    }

    launch(wss_ip: string, port: number) {

        this.prepare();

        this.socket = new WebSocket('ws://' + wss_ip + ':' + port.toString() + '/');

        var self = this;

        this.socket.onopen = function (event) {

            self.eventCallback(MatchStatus.opened_socket, self);

            if (self.socket !== undefined) {

                self.socket.onmessage = function (event: MessageEvent) {

                    // console.log('Match control websocket(' + self.match.key + ') received message: ' + event.data.toString());

                    self.control(JSON.parse(event.data.toString()) as WS_MSG);

                };

                self.socket.onerror = function (error) {

                    self.eventCallback(MatchStatus.error_socket, self);

                    console.log('Match control websocket(' + self.key + ') error: ' + error);

                };

                self.socket.onclose = function (event) {

                    self.eventCallback(MatchStatus.closed_socket, self);

                    console.log('Match control websocket(' + self.key + ') closed.');

                };

                self.wait_to_registry();

            };

        }

        self.eventCallback(MatchStatus.launched, self);

    }

    private end(info?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.isRunning = false;

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.match_end,
                    msg_content: {
                        info: info
                    }
                }));

            this.eventCallback(MatchStatus.finished, this);

        }

    }


}


// const match1: Match = {
//     key: "m1",
//     name: "match1",
//     config: {
//         show_options: false,
//         min_amount_players: 2,
//         max_amount_players: 2,
//         wait_to_registry_at_match_time: 60000,
//         wait_to_start_match_time: 10000,
//         wait_to_shooting_time: 5000,
//         wait_to_round_resume_time: 10000
//     },
//     rounds: [],
//     Keyplayer_score_map: new Map()
// };

// const ws_match = new WS_Match("m1", match1,(ev:string, wsmatch:WS_Match)=>{}, "localhost", 5555);
