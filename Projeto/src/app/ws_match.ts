import { Match } from "./match";
import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Protocol } from "./protocol";
import { MatchStatus } from "./match_status";
import { Player } from "./player";
import { Round_Response_State } from "./round_response_state";

export const WS_Match_State = {

    unlaunched_match: -1,
    launched_match: 0,
    wait_to_registry_match: 1,

    player_registed_match: 2,
    player_unregisted_match: 3,

    wait_to_start_match: 4,
    started_match: 5,

    wait_to_start_next_round: 6,
    started_next_round: 7,
    wait_to_shooting_round: 8,
    wait_to_pass_round: 9,
    wait_to_response_round: 10,
    pass_round: 11,
    response_round: 12,

    wait_to_resume_round: 13,// mostra o resultado do round    
    resume_round: 14,// prossegue    

    wait_to_end_match: 15,
    ended_match: 16,
    wait_to_abort_match: 17,
    aborted_match: 18,


} as const;

export class WS_Match {

    key: string;
    owner_user_key: string;
    match: Match;

    players: { [key: string]: Player } = {};

    player_response: string | undefined = undefined;
    player_pass: string | undefined = undefined;
    round_response: string | undefined = undefined;
    round_response_state: number = Round_Response_State.timeout_shooting;
    match_info: string | undefined = undefined;

    match_state: number = WS_Match_State.unlaunched_match;

    round_index: number = -1;
    round_score: number = 0;

    wait_time: number = 0;
    wait_timestamp: number = 0;

    wait_to_round_start_timeoutId: NodeJS.Timeout | undefined = undefined;
    wait_to_round_shooting_timeoutId: NodeJS.Timeout | undefined = undefined;
    wait_to_round_response_timeoutId: NodeJS.Timeout | undefined = undefined;
    wait_to_round_pass_timeoutId: NodeJS.Timeout | undefined = undefined;
    wait_to_start_intervalId: NodeJS.Timer | undefined = undefined;
    wait_to_registry_intervalId: NodeJS.Timer | undefined = undefined;
    wait_to_round_resume_intervalId: NodeJS.Timer | undefined = undefined;

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

    private scoreboard(): { [key: string]: { name: string; avatar: number; score: number; } } {

        let sb: { [key: string]: { name: string; avatar: number; score: number } } = {};

        for (const player_key in this.players) {

            sb[player_key] = { name: this.players[player_key].name, avatar: this.players[player_key].avatar, score: 0 };

            for (let index = 0; index < this.players[player_key].scores.length; index++) {

                sb[player_key].score += this.players[player_key].scores[index].value;

            }

        }

        sb = Object.fromEntries(
            Object.entries(sb).sort(([,a],[,b]) => b.score - a.score)
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
                    this.shooting_response(msg_obj.msg_content.round_index, sender);
                    break;

                case Protocol.match_shot_pass:
                    this.shooting_pass(msg_obj.msg_content.round_index, sender);
                    break;

                case Protocol.match_pass:
                    this.pass(msg_obj.msg_content.round_index, msg_obj.msg_content.player_response, sender);
                    break;

                case Protocol.match_response:
                    this.response(msg_obj.msg_content.round_index, msg_obj.msg_content.round_response, sender, msg_obj.msg_content.player_pass);
                    break;

                case Protocol.match_state:
                    this.wait_time = Math.max(0, this.wait_time - (Date.now() - this.wait_timestamp));
                    this.send_state(sender);
                    break;

                case Protocol.player_registry_at_match:
                    this.register({
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

    private pass(roundIndex: number, player_response: string, player_pass: string) {

        console.log("PASS");
        console.log("  -roundIndex: " + roundIndex);
        console.log("  -player_response: " + player_response);
        console.log("  -player_pass: " + player_pass);


        if (this.match_state === WS_Match_State.wait_to_pass_round
            && roundIndex === this.round_index
            && player_response in this.players
            && player_pass in this.players) {

            if (this.wait_to_round_pass_timeoutId !== undefined) {
                clearTimeout(this.wait_to_round_pass_timeoutId);
                this.wait_to_round_pass_timeoutId = undefined;
            }

            this.match_state = WS_Match_State.pass_round;
            this.wait_time = 0;
            this.wait_timestamp = Date.now();
            this.player_pass = player_pass;
            this.player_response = player_response;
            this.round_response = undefined;
            this.round_response_state = Round_Response_State.pass;
            this.send_state();

            this.wait_to_response_round(player_response, player_pass);

        }

    }

    private score() {

        if (this.round_index > -1 && this.round_index < this.match.rounds.length) {

            var score = this.match.rounds[this.round_index].score;

            switch (this.round_response_state) {

                case Round_Response_State.timeout_shooting:

                    for (const player_key in this.players) {

                        this.players[player_key].scores.push({
                            round_response_state: Round_Response_State.timeout_shooting,
                            value: 0
                        });

                    }

                    break;

                case Round_Response_State.timeout_response:

                    for (const player_key in this.players) {

                        if (player_key === this.player_response) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.timeout_response,
                                value: 0
                            });

                        } else {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.timeout_response,
                                value: score
                            });

                        }



                    }

                    break;

                case Round_Response_State.timeout_pass:

                    for (const player_key in this.players) {

                        if (player_key === this.player_pass) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.timeout_pass,
                                value: 0
                            });

                        } else {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.timeout_pass,
                                value: score
                            });

                        }

                    }

                    break;

                case Round_Response_State.timeout_pass_response:

                    for (const player_key in this.players) {

                        if (player_key === this.player_response) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.timeout_pass_response,
                                value: 0
                            });

                        } else if (player_key === this.player_pass) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.timeout_pass_response,
                                value: score
                            });

                        } else {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.timeout_pass_response,
                                value: 0
                            });

                        }

                    }

                    break;

                case Round_Response_State.right_response:

                    for (const player_key in this.players) {

                        if (player_key === this.player_response) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.right_response,
                                value: score
                            });

                        } else {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.right_response,
                                value: 0
                            });

                        }

                    }

                    break;

                case Round_Response_State.wrong_response:

                    for (const player_key in this.players) {

                        if (player_key === this.player_response) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.wrong_response,
                                value: 0
                            });

                        } else {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.wrong_response,
                                value: 0
                            });

                        }

                    }

                    break;
                case Round_Response_State.right_pass_response:

                    for (const player_key in this.players) {

                        if (player_key === this.player_response) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.right_pass_response,
                                value: 2 * score
                            });

                        } else if (player_key === this.player_pass) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.right_pass_response,
                                value: 0
                            });

                        } else {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.right_pass_response,
                                value: score
                            });

                        }

                    }

                    break;

                case Round_Response_State.wrong_pass_response:

                    for (const player_key in this.players) {

                        if (player_key === this.player_response) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.wrong_pass_response,
                                value: 0
                            });

                        } else if (player_key === this.player_pass) {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.wrong_pass_response,
                                value: score
                            });

                        } else {

                            this.players[player_key].scores.push({
                                round_response_state: Round_Response_State.wrong_pass_response,
                                value: 0
                            });

                        }

                    }

                    break;

            }

        }

    }

    response(roundIndex: number, roundResponse: string, player_response: string, player_pass: string | undefined = undefined) {

        if (this.match_state === WS_Match_State.wait_to_response_round
            && roundIndex === this.round_index
            && player_response in this.players) {

            if (this.wait_to_round_response_timeoutId !== undefined) {
                clearTimeout(this.wait_to_round_response_timeoutId);
                this.wait_to_round_response_timeoutId = undefined;
            }

            this.match_state = WS_Match_State.response_round;
            this.wait_time = 0;
            this.wait_timestamp = Date.now();
            this.player_pass = player_pass;
            this.player_response = player_response;
            this.round_response = roundResponse;

            if (player_pass !== undefined) {

                if (roundResponse === this.match.rounds[this.round_index].question.true_option) {

                    this.round_response_state = Round_Response_State.right_pass_response;

                } else {

                    this.round_response_state = Round_Response_State.wrong_pass_response;

                }

            } else {

                if (roundResponse === this.match.rounds[this.round_index].question.true_option) {

                    this.round_response_state = Round_Response_State.right_response;

                } else {

                    this.round_response_state = Round_Response_State.wrong_response;

                }

            }



            this.send_state();

            this.wait_to_round_resume(false);

        }

    }

    wait_to_round_resume(timeout: boolean) {

        var self = this;
        this.wait_to_round_resume_intervalId = setTimeout(() => {

            if (self.match_state === WS_Match_State.wait_to_resume_round)

                self.round_resume();

        }, this.match.config.wait_to_round_resume_time);

        this.score();

        this.match_state = WS_Match_State.wait_to_resume_round;
        this.wait_time = this.match.config.wait_to_round_resume_time;
        this.wait_timestamp = Date.now();

        this.send_state();

    }

    round_resume() {

        this.match_state = WS_Match_State.resume_round;
        this.wait_time = 0;
        this.wait_timestamp = Date.now();
        this.send_state();
        this.wait_to_next_round_start();

    }

    wait_to_shooting_round() {

        if (this.round_index > -1 && this.round_index < this.match.rounds.length) {

            var self = this;
            this.wait_to_round_shooting_timeoutId = setTimeout(() => {

                if (self.match_state === WS_Match_State.wait_to_shooting_round) {

                    self.wait_to_round_resume(true);

                }

            }, this.match.rounds[this.round_index].shooting_timeout);

            this.match_state = WS_Match_State.wait_to_shooting_round;
            this.wait_time = this.match.rounds[this.round_index].shooting_timeout;
            this.wait_timestamp = Date.now();
            this.player_pass = undefined;
            this.player_response = undefined;
            this.round_response = undefined;
            this.round_response_state = Round_Response_State.timeout_shooting;

            this.send_state();

        }

    }

    wait_to_response_round(player_response: string, player_pass: string | undefined = undefined) {

        var self = this;
        this.wait_to_round_response_timeoutId = setTimeout(() => {

            self.wait_to_round_resume(true);

        }, this.match.rounds[this.round_index].response_timeout);

        this.match_state = WS_Match_State.wait_to_response_round;
        this.wait_time = this.match.rounds[this.round_index].response_timeout;
        this.wait_timestamp = Date.now();
        this.player_pass = player_pass;
        this.player_response = player_response;
        this.round_response = undefined;

        if (player_pass !== undefined) {

            this.round_response_state = Round_Response_State.timeout_pass_response;

        } else {

            this.round_response_state = Round_Response_State.timeout_response;

        }


        this.send_state();

    }

    wait_to_pass_round(player_pass: string) {

        var self = this;
        this.wait_to_round_pass_timeoutId = setTimeout(() => {

            self.wait_to_round_resume(true);

        }, this.match.rounds[this.round_index].pass_timeout);

        this.match_state = WS_Match_State.wait_to_pass_round;
        this.wait_time = this.match.rounds[this.round_index].pass_timeout;
        this.wait_timestamp = Date.now();
        this.player_pass = player_pass;
        this.player_response = undefined;
        this.round_response = undefined;
        this.round_response_state = Round_Response_State.timeout_pass;

        this.send_state();

    }

    shooting_response(roundIndex: number, player_response: string) {

        if (this.match_state === WS_Match_State.wait_to_shooting_round
            && roundIndex === this.round_index
            && player_response in this.players) {

            if (this.wait_to_round_shooting_timeoutId !== undefined) {
                clearTimeout(this.wait_to_round_shooting_timeoutId);
                this.wait_to_round_shooting_timeoutId = undefined;
            }

            this.wait_to_response_round(player_response);

        }

    }

    shooting_pass(roundIndex: number, player_pass: string) {

        if (this.match_state === WS_Match_State.wait_to_shooting_round
            && roundIndex === this.round_index
            && player_pass in this.players) {

            if (this.wait_to_round_shooting_timeoutId !== undefined) {
                clearTimeout(this.wait_to_round_shooting_timeoutId);
                this.wait_to_round_shooting_timeoutId = undefined;
            }

            this.wait_to_pass_round(player_pass);


        }

    }

    unregister(player_key: string): boolean {

        if (player_key in this.players && this.match_state === WS_Match_State.wait_to_registry_match) {

            delete this.players[player_key];

            WS_Match_State.wait_to_registry_match;
            this.wait_time = Math.max(0, this.wait_time - (Date.now() - this.wait_timestamp));

            this.send_state();

            return true;

        }

        return false;

    }

    register(player: Player): boolean {

        if (this.match_state === WS_Match_State.wait_to_registry_match
            && Object.keys(this.players).length < this.match.config.max_amount_players) {

            this.players[player.key] = player;

            const isOpenToRegistry = Object.keys(this.players).length < this.match.config.max_amount_players;

            WS_Match_State.wait_to_registry_match;
            this.wait_time = Math.max(0, this.wait_time - (Date.now() - this.wait_timestamp));
            this.send_state();

            if (!isOpenToRegistry && this.match.config.start_match_upon_completing_registration) {

                if (this.wait_to_registry_intervalId !== undefined) {
                    clearTimeout(this.wait_to_registry_intervalId);
                    this.wait_to_registry_intervalId = undefined;
                }

                this.wait_to_start();

            }

            return true;

        }

        return false;

    }

    private send_state(receiver?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            let theme: string | undefined = undefined;
            let description: string | undefined = undefined;
            let options: string[] | undefined = undefined;

            if (this.round_index > -1 && this.round_index < this.match.rounds.length) {

                description = this.match.rounds[this.round_index].question.description;
                theme = this.match.rounds[this.round_index].quiz_theme;

                options = [];

                for (let option in this.match.rounds[this.round_index].question.fake_options) {
                    options.push(this.match.rounds[this.round_index].question.fake_options[option]);
                }

                options.push(this.match.rounds[this.round_index].question.true_option);

                options.sort(function (a, b) { return 0.5 - Math.random() });

            }


            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: receiver || "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.match_state,
                    msg_content: {

                        ws_macth_min_amount_players: this.match.config.min_amount_players,
                        ws_macth_max_amount_players: this.match.config.max_amount_players,
                        ws_match_state: this.match_state,
                        round_response: this.round_response,
                        round_response_state: this.round_response_state,
                        player_response: this.player_response,
                        player_pass: this.player_pass,
                        round_index: this.round_index,
                        round_score: this.round_score,
                        match_info: this.match_info,
                        match_show_question_options: this.match.config.show_options,
                        match_avatares: this.match.config.avatares,
                        scoreboard: this.scoreboard(),
                        quiz_theme: theme,
                        question_description: description,
                        question_options: options,
                        ws_timestamp: Date.now(),
                        ws_wait_time: this.wait_time,
                        ws_wait_timestamp: this.wait_timestamp

                    }

                }));

        }

    }

    abort(info?: string) {

        this.match_info = info;
        this.match_state = WS_Match_State.aborted_match;
        this.wait_timestamp = Date.now();
        this.wait_time = 0;

        this.send_state();

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.close(1000, info);

        }

        this.eventCallback(MatchStatus.aborted, this);

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

        if (this.wait_to_round_start_timeoutId !== undefined) {
            clearTimeout(this.wait_to_round_start_timeoutId);
            this.wait_to_round_start_timeoutId = undefined;
        }

        if (this.wait_to_round_shooting_timeoutId !== undefined) {
            clearTimeout(this.wait_to_round_shooting_timeoutId);
            this.wait_to_round_shooting_timeoutId = undefined;
        }

        if (this.wait_to_round_resume_intervalId !== undefined) {
            clearTimeout(this.wait_to_round_resume_intervalId);
            this.wait_to_round_resume_intervalId = undefined;
        }

        if (this.wait_to_round_response_timeoutId !== undefined) {
            clearTimeout(this.wait_to_round_response_timeoutId);
            this.wait_to_round_response_timeoutId = undefined;
        }

        if (this.wait_to_round_pass_timeoutId !== undefined) {
            clearTimeout(this.wait_to_round_pass_timeoutId);
            this.wait_to_round_pass_timeoutId = undefined;
        }

        this.match_state = WS_Match_State.unlaunched_match;
        this.wait_time = 0;
        this.wait_timestamp = 0;
        this.player_pass = undefined;
        this.player_response = undefined;
        this.round_response = undefined;
        this.round_index = -1;

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.close(1000);

        }

        this.socket = undefined;

    }

    private wait_to_next_round_start() {

        var self = this;
        this.wait_to_round_start_timeoutId = setTimeout(() => {

            if (self.match_state === WS_Match_State.wait_to_start_next_round) {

                self.next_round();

            }

        }, this.match.config.wait_to_next_round_start_time);

        this.match_state = WS_Match_State.wait_to_start_next_round;
        this.wait_time = this.match.config.wait_to_next_round_start_time;
        this.wait_timestamp = Date.now();

        this.send_state();

    }

    private next_round() {

        this.round_index++;

        if (this.round_index < this.match.rounds.length) {

            this.match_state = WS_Match_State.started_next_round;
            this.wait_timestamp = Date.now();
            this.wait_time = 0;
            this.player_pass = undefined;
            this.player_response = undefined;
            this.round_response = undefined;
            this.round_response_state = Round_Response_State.timeout_shooting;
            this.round_score = this.match.rounds[this.round_index].score;

            this.send_state();

            if(Object.keys(this.players).length === 1){

                var player = Object.keys(this.players)[0];
                this.wait_to_response_round(player);

            } else {

                this.wait_to_shooting_round();

            }

            

        } else {

            this.round_index = -1;

            this.wait_to_end("match ended normally");

        }

    }

    private start() {

        this.match_state = WS_Match_State.started_match;
        this.wait_timestamp = Date.now();
        this.wait_time = 0;

        this.send_state();

        this.eventCallback(MatchStatus.started, this);

        // this.wait_to_next_round_start();
        this.next_round();

    }

    private wait_to_start() {

        var self = this;
        this.wait_to_start_intervalId = setTimeout(() => {

            if (self.match_state === WS_Match_State.wait_to_start_match) {

                self.start();

            }

        }, self.match.config.wait_to_start_match_time);

        this.match_state = WS_Match_State.wait_to_start_match;
        this.wait_time = this.match.config.wait_to_start_match_time;
        this.wait_timestamp = Date.now();

        this.send_state();

        self.eventCallback(MatchStatus.wait_to_start, self);

    }

    private wait_to_registry() {

        var self = this;
        this.wait_to_registry_intervalId = setTimeout(() => {

            if (self.match_state === WS_Match_State.wait_to_registry_match) {

                if (Object.keys(this.players).length < self.match.config.min_amount_players) {

                    self.wait_to_abort("no min amount players");

                    return;

                } else {

                    self.wait_to_start();

                }

            }

        }, self.match.config.wait_to_registry_at_match_time);

        this.match_state = WS_Match_State.wait_to_registry_match;
        this.wait_time = this.match.config.wait_to_registry_at_match_time;
        this.wait_timestamp = Date.now();

        this.send_state();

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

                self.match_state = WS_Match_State.launched_match;
                self.wait_timestamp = Date.now();
                self.wait_time = 0;

                self.socket.send(
                    JSON.stringify({
                        sender: self.key,
                        sender_cluster: self.key,
                        receiver: "__server__",
                        receiver_cluster: self.key,
                        msg_type: Protocol.wss_client_register,
                        msg_content: {}
                    }));

                self.wait_to_registry();

            };

        }

        self.eventCallback(MatchStatus.launched, self);

    }

    private end(info?: string) {

        this.match_state = WS_Match_State.ended_match;
        this.wait_timestamp = Date.now();
        this.wait_time = 0;
        this.send_state();

        this.eventCallback(MatchStatus.finished, this);
        this.wait_to_abort(info);

    }

    private wait_to_end(info?: string) {

        this.match_info = info;
        var self = this;
        setTimeout(() => {

            self.end(info);

        }, self.match.config.wait_to_match_end_time);

        this.match_state = WS_Match_State.wait_to_end_match;
        this.wait_time = self.match.config.wait_to_match_abort_time;
        this.wait_timestamp = Date.now();

        this.send_state();

    }

    private wait_to_abort(info?: string) {

        var self = this;
        this.match_info = info;

        setTimeout(() => {

            self.abort(info);

        }, self.match.config.wait_to_match_abort_time);

        this.match_state = WS_Match_State.wait_to_abort_match;
        this.wait_time = self.match.config.wait_to_match_abort_time;
        this.wait_timestamp = Date.now();

        this.send_state();

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
