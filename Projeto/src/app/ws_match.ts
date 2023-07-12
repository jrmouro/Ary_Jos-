import { Match } from "./match";
import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Protocol } from "./protocol";
import { MatchStatus } from "./match_status";
import { Player } from "./player";
import { Round_State_Value } from "./round_state";
import { Round } from "./round";
import { _WS_Match_State, Unlaunched_Match_State } from "./ws_match_state";


export class WS_Match {

    key: string;
    owner_user_key: string;
    match: Match;
    players: { [key: string]: Player } = {};
    readonly match_round_entries: [string, Round][];
    socket: WebSocket | undefined = undefined;
    eventCallback: (event: string, wsmatch: WS_Match) => void;
    private ws_match_state: _WS_Match_State;

    constructor(key: string, owner_user_key: string, match: Match, eventCallback: (event: string, wsmatch: WS_Match) => void, wss_ip?: string, port?: number) {
        this.key = key;
        this.owner_user_key = owner_user_key;
        this.match = match;
        this.match_round_entries = Object.entries(this.match.rounds);
        this.eventCallback = eventCallback;
        this.ws_match_state = new Unlaunched_Match_State(this);
        if (wss_ip !== undefined && port !== undefined) {
            this.launch(wss_ip, port);
        }
    }

    set_state(ws_match_state: _WS_Match_State, send: boolean = true, follow: boolean = true): void {

        this.ws_match_state = ws_match_state;

        if (send) {
            this.ws_match_state.update_time();
            this.send_state();
        }

        if(follow) this.ws_match_state.follow();

    }

    private scoreboard(): { [key: string]: { name: string; avatar: number; score: number; } } {

        let sb: { [key: string]: { name: string; avatar: number; score: number } } = {};

        for (const player_key in this.players) {

            sb[player_key] = { name: this.players[player_key].name, avatar: this.players[player_key].avatar, score: 0 };

            for (let index = 0; index < this.players[player_key].scores.length; index++) {

                sb[player_key].score += this.players[player_key].scores[index].value;

            }

        }

        sb = Object.fromEntries(
            Object.entries(sb).sort(([, a], [, b]) => b.score - a.score)
        );

        return sb;

    }


    private control(msg_obj: WS_MSG) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;

        if (receiver === this.key && sender !== undefined && sender !== this.key) {

            switch (msg_type) {

                case Protocol.match_shot_response:
                    
                    this.ws_match_state.shot_response(
                        msg_obj.msg_content.round_index,
                        sender);
                    break;

                case Protocol.match_shot_pass:
                    
                    this.ws_match_state.shot_pass(
                        msg_obj.msg_content.round_index,
                        sender);
                    break;

                case Protocol.match_pass:
                    
                    this.ws_match_state.pass(
                        msg_obj.msg_content.round_index,
                        msg_obj.msg_content.player_response,
                        sender);
                    break;

                case Protocol.match_response:
                    
                    this.ws_match_state.response(
                        msg_obj.msg_content.round_index,                        
                        sender,
                        msg_obj.msg_content.player_pass,
                        msg_obj.msg_content.round_response)
                    break;

                case Protocol.match_state:
                    
                    this.send_state(sender);
                    break;

                case Protocol.player_registry_at_match:

                    this.ws_match_state.register({
                        key: msg_obj.msg_content.player_key,
                        name: msg_obj.msg_content.player_name,
                        avatar: msg_obj.msg_content.avatar,
                        config: {},
                        scores: []
                    })
                    break;

            }

        }

    }

    score() {

        if (this.ws_match_state.round_state !== undefined) {

            const round_index = this.ws_match_state.round_state.round_index;

            if (round_index > -1 && round_index < this.match_round_entries.length) {

                var score = this.match_round_entries[round_index][1].score;

                switch (this.ws_match_state.round_state.state_value) {

                    case Round_State_Value.wait_shooting:

                        for (const player_key in this.players) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_State_Value.wait_shooting,
                                value: 0
                            });

                        }

                        break;

                    case Round_State_Value.wait_response:

                        for (const player_key in this.players) {

                            if (player_key === this.ws_match_state.round_state.player_response) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wait_response,
                                    value: 0
                                });

                            } else {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wait_response,
                                    value: score
                                });

                            }

                        }

                        break;

                    case Round_State_Value.wait_pass:

                        for (const player_key in this.players) {

                            if (player_key === this.ws_match_state.round_state.player_pass) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wait_pass,
                                    value: 0
                                });

                            } else {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wait_pass,
                                    value: score
                                });

                            }

                        }

                        break;

                    case Round_State_Value.wait_pass_response:

                        for (const player_key in this.players) {

                            if (player_key === this.ws_match_state.round_state.player_response) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wait_pass_response,
                                    value: 0
                                });

                            } else if (player_key === this.ws_match_state.round_state.player_pass) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wait_pass_response,
                                    value: score
                                });

                            } else {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wait_pass_response,
                                    value: 0
                                });

                            }

                        }

                        break;

                    case Round_State_Value.right_response:

                        for (const player_key in this.players) {

                            if (player_key === this.ws_match_state.round_state.player_response) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.right_response,
                                    value: score
                                });

                            } else {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.right_response,
                                    value: 0
                                });

                            }

                        }

                        break;

                    case Round_State_Value.wrong_response:

                        for (const player_key in this.players) {

                            if (player_key === this.ws_match_state.round_state.player_response) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wrong_response,
                                    value: 0
                                });

                            } else {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wrong_response,
                                    value: 0
                                });

                            }

                        }

                        break;
                    case Round_State_Value.right_pass_response:

                        for (const player_key in this.players) {

                            if (player_key === this.ws_match_state.round_state.player_response) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.right_pass_response,
                                    value: 2 * score
                                });

                            } else if (player_key === this.ws_match_state.round_state.player_pass) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.right_pass_response,
                                    value: 0
                                });

                            } else {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.right_pass_response,
                                    value: score
                                });

                            }

                        }

                        break;

                    case Round_State_Value.wrong_pass_response:

                        for (const player_key in this.players) {

                            if (player_key === this.ws_match_state.round_state.player_response) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wrong_pass_response,
                                    value: 0
                                });

                            } else if (player_key === this.ws_match_state.round_state.player_pass) {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wrong_pass_response,
                                    value: score
                                });

                            } else {

                                this.players[player_key].scores.push({
                                    round_response_state: Round_State_Value.wrong_pass_response,
                                    value: 0
                                });

                            }

                        }

                        break;

                }

            }

        }

    }


    private send_state(receiver?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            let theme: string | undefined = undefined;
            let description: string | undefined = undefined;
            let options: string[] | undefined = undefined;
            let score: number | undefined = undefined;

            if (this.ws_match_state.round_state !== undefined) {

                const round_index = this.ws_match_state.round_state.round_index;

                if (round_index > -1 && round_index < this.match_round_entries.length) {

                    description = this.match_round_entries[round_index][1].question.description;
                    theme = this.match_round_entries[round_index][1].quiz_theme;
                    score = this.match_round_entries[round_index][1].score;
                    options = [];

                    for (let option in this.match_round_entries[round_index][1].question.fake_options) {
                        options.push(this.match_round_entries[round_index][1].question.fake_options[option]);
                    }

                    options.push(this.match_round_entries[round_index][1].question.true_option);

                    options.sort(function (a, b) { return 0.5 - Math.random() });

                }

            }

            // this.ws_match_state.update_time();

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: receiver || "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.match_state,
                    msg_content: {

                        ws_match_state: this.ws_match_state.state_value,
                        ws_macth_min_amount_players: this.match.config.min_amount_players,
                        ws_macth_max_amount_players: this.match.config.max_amount_players,
                        ws_timestamp: Date.now(),
                        ws_wait_timestamp: this.ws_match_state.wait_timestamp,
                        ws_wait_time: this.ws_match_state.wait_time,

                        round_response: this.ws_match_state.round_state ? this.ws_match_state.round_state.round_response : undefined,
                        round_response_state: this.ws_match_state.round_state ? this.ws_match_state.round_state.state_value : undefined,
                        player_response: this.ws_match_state.round_state ? this.ws_match_state.round_state.player_response : undefined,
                        player_pass: this.ws_match_state.round_state ? this.ws_match_state.round_state.player_pass : undefined,
                        round_index: this.ws_match_state.round_state ? this.ws_match_state.round_state.round_index : undefined,
                        round_score: score,

                        // match_info: this.match_info,
                        match_show_question_options: this.match.config.show_options,
                        match_avatares: this.match.config.avatares,
                        scoreboard: this.scoreboard(),
                        quiz_theme: theme,
                        question_description: description,
                        question_options: options,



                    }

                }));

        }

    }

    abort(info?: string) {

        this.ws_match_state.abort();

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.close(1000, info);

        }

        this.eventCallback(MatchStatus.aborted, this);

    }

    launch(wss_ip: string, port: number) {

        this.socket = new WebSocket('ws://' + wss_ip + ':' + port.toString() + '/');

        var self = this;

        this.socket.onopen = function (event) {

            self.eventCallback(MatchStatus.opened_socket, self);

            if (self.socket !== undefined) {

                self.socket.onmessage = function (event: MessageEvent) {

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

                self.socket.send(
                    JSON.stringify({
                        sender: self.key,
                        sender_cluster: self.key,
                        receiver: "__server__",
                        receiver_cluster: self.key,
                        msg_type: Protocol.wss_client_register,
                        msg_content: {}
                    }));


                self.ws_match_state.launch();


            };

        }


    }

}

