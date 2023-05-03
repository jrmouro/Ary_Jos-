import { Match } from "./match";
import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Protocol } from "./protocol";
import { MatchStatus } from "./match_status";
import { Player } from "./player";
import { ScoreType } from "./score";

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

    wait_to_shooting_pass_round: 9,
    wait_to_shooting_response_round: 10,
    player_point_pass_round: 11,
    reponse_round: 12,

    wait_to_resume_round: 13,// mostra o resultado do round    
    resume_round: 14,// prossegue    

    ended_match: 15,
    wait_to_abort_match: 16,
    aborted_match: 17,



} as const;

export class WS_Match {

    key: string;
    owner_user_key: string;
    match: Match;

    players: { [key: string]: Player } = {};

    player_response: string | undefined = undefined;
    player_pass: string | undefined = undefined;
    round_response: string | undefined = undefined;
    matchInfo: string | undefined = undefined;

    match_state: number = WS_Match_State.unlaunched_match;

    roundIndex: number = -1;

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

    private scoreboard(): { [key: string]: { name: string; avatar:string; score: number; } } {

        const sb: { [key: string]: { name: string; avatar:string; score: number } } = {};

        for (const player_key in this.players) {

            sb[player_key] = { name: this.players[player_key].name, avatar:this.players[player_key].avatar,score: 0 };

            for (let index = 0; index < this.players[player_key].scores.length; index++) {

                sb[player_key].score += this.players[player_key].scores[index].value;

            }

        }

        return sb;

    }


    private control(msg_obj: WS_MSG) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;

        if (receiver === this.key && sender !== undefined && sender !== this.key) {

            switch (msg_type) {

                case Protocol.match_shot_pass:
                    this.shooting_pass(sender);
                    break;

                case Protocol.match_shot_response:
                    this.shooting_response(sender);
                    break;

                case Protocol.match_point_at_pass:
                    this.point_pass(sender, msg_obj.msg_content);
                    break;

                case Protocol.match_response:
                    this.response(sender, msg_obj.msg_content);
                    break;

                case Protocol.match_state:
                    this.wait_time = Math.max(0, this.wait_time - (Date.now() - this.wait_timestamp));
                    this.send_state(sender);
                    break;

            }

        }

    }

    private point_pass(sender: string, content: { player_pointed: string; }) {

        const player_pointed = content.player_pointed;

        if (player_pointed in this.players && sender in this.players) {

            if (this.wait_to_round_pass_timeoutId !== undefined) {
                clearTimeout(this.wait_to_round_pass_timeoutId);
                this.wait_to_round_pass_timeoutId = undefined;
            }

            this.match_state = WS_Match_State.player_point_pass_round;
            this.wait_time = 0;
            this.wait_timestamp = Date.now();

            this.player_response = player_pointed;
            this.player_pass = sender;

            this.send_state();

            this.shooting_response(player_pointed, sender);

        }

    }

    private score(timeout_pass: boolean) {

        if (this.roundIndex > -1 && this.roundIndex < this.match.rounds.length) {

            var score = this.match.rounds[this.roundIndex].score;

            if (timeout_pass && this.player_pass !== undefined && this.player_response !== undefined) {

                this.players[this.player_response].scores.push({
                    scoretype: ScoreType.pass_response,
                    value: score
                })

            } else {

                if (this.match.rounds[this.roundIndex].question.true_option === this.round_response) {

                    if (this.player_pass !== undefined && this.player_response !== undefined) {

                        this.players[this.player_response].scores.push({
                            scoretype: ScoreType.response_pass,
                            value: score * 2
                        });

                    } else if (this.player_response !== undefined) {

                        this.players[this.player_response].scores.push({
                            scoretype: ScoreType.response,
                            value: score
                        });

                    }


                } else {

                    if (this.player_pass !== undefined) {

                        this.players[this.player_pass].scores.push({
                            scoretype: ScoreType.pass_response,
                            value: score
                        })

                    }

                }

            }

        }

    }

    response(

        sender: string,
        content:
            {
                roundResponse: string;
                roundIndex: number;
                player_pass: string | undefined;
            }) {

        if (
            this.match_state === WS_Match_State.wait_to_shooting_response_round
            && this.roundIndex === content.roundIndex
            && sender in this.players) {

            if (this.wait_to_round_response_timeoutId !== undefined) {
                clearTimeout(this.wait_to_round_response_timeoutId);
                this.wait_to_round_response_timeoutId = undefined;
            }

            this.match_state = WS_Match_State.reponse_round;
            this.wait_time = 0;
            this.wait_timestamp = Date.now();

            this.player_response = sender;
            this.player_pass = content.player_pass;
            this.round_response = content.roundResponse;

            this.send_state()

            this.wait_to_round_resume(false);

        }

    }

    wait_to_round_resume(timeout: boolean) {

        var self = this;
        this.wait_to_round_resume_intervalId = setTimeout(() => {

            if (self.match_state === WS_Match_State.wait_to_resume_round)

                self.round_resume();

        }, this.match.config.wait_to_round_resume_time);

        this.score(timeout);

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

    wait_to_shooting() {

        if (this.roundIndex > -1 && this.roundIndex < this.match.rounds.length) {

            var self = this;
            this.wait_to_round_shooting_timeoutId = setTimeout(() => {

                if (self.match_state === WS_Match_State.wait_to_shooting_round) {

                    self.wait_to_round_resume(true);

                }

            }, this.match.rounds[this.roundIndex].shooting_timeout);

            this.match_state = WS_Match_State.wait_to_shooting_round;
            this.wait_time = this.match.rounds[this.roundIndex].shooting_timeout;
            this.wait_timestamp = Date.now();

            this.send_state();

        }

    }

    shooting_response(sender: string, player_pass: string | undefined = undefined) {

        if (this.roundIndex > -1 && this.roundIndex < this.match.rounds.length) {

            if (this.match_state === WS_Match_State.wait_to_shooting_round && sender in this.players) {

                if (this.wait_to_round_shooting_timeoutId !== undefined) {
                    clearTimeout(this.wait_to_round_shooting_timeoutId);
                    this.wait_to_round_shooting_timeoutId = undefined;
                }

                var self = this;
                this.wait_to_round_response_timeoutId = setTimeout(() => {

                    self.wait_to_round_resume(true);

                }, this.match.rounds[this.roundIndex].response_timeout);

                this.match_state = WS_Match_State.wait_to_shooting_response_round;
                this.wait_time = this.match.rounds[this.roundIndex].response_timeout;
                this.wait_timestamp = Date.now();
                this.player_pass = player_pass;
                this.player_response = sender;
                this.round_response = undefined;

                this.send_state();

            }

        }

    }

    shooting_pass(sender: string) {

        if (this.roundIndex > -1 && this.roundIndex < this.match.rounds.length) {

            if (this.match_state === WS_Match_State.wait_to_shooting_round && sender in this.players) {

                if (this.wait_to_round_shooting_timeoutId !== undefined) {
                    clearTimeout(this.wait_to_round_shooting_timeoutId);
                    this.wait_to_round_shooting_timeoutId = undefined;
                }

                var self = this;
                this.wait_to_round_response_timeoutId = setTimeout(() => {

                    self.wait_to_round_resume(true);

                }, this.match.rounds[this.roundIndex].pass_timeout);


                this.match_state = WS_Match_State.wait_to_shooting_pass_round;
                this.wait_time = this.match.rounds[this.roundIndex].pass_timeout;
                this.wait_timestamp = Date.now();
                this.player_pass = sender;
                this.player_response = undefined;
                this.round_response = undefined;

                this.send_state();

            }

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
            // else {

            //     WS_Match_State.wait_to_registry_match;
            //     this.send_state();

            // }

            return true;

        }

        return false;

    }

    private send_state(receiver?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            let theme: string | undefined = undefined;
            let description: string | undefined = undefined;
            let options: string[] = [];

            if (this.roundIndex > -1 && this.roundIndex < this.match.rounds.length) {

                description = this.match.rounds[this.roundIndex].question.description;
                theme = this.match.rounds[this.roundIndex].quiz_theme;

                for (let option in this.match.rounds[this.roundIndex].question.fake_options) {
                    options.push(this.match.rounds[this.roundIndex].question.fake_options[option]);
                }

                options.push(this.match.rounds[this.roundIndex].question.true_option);

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
                        player_response: this.player_response,
                        player_pass: this.player_pass,
                        roundIndex: this.roundIndex,
                        matchInfo: this.matchInfo,
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

        this.matchInfo = info;
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
        this.roundIndex = -1;

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

        this.roundIndex++;

        if (this.roundIndex < this.match.rounds.length) {

            this.match_state = WS_Match_State.started_next_round;
            this.wait_timestamp = Date.now();
            this.wait_time = 0;
            this.player_pass = undefined;
            this.player_response = undefined;
            this.round_response = undefined;

            this.send_state();

            this.wait_to_shooting();

        } else {

            this.roundIndex = -1;

            this.end("match ended normally");

        }

    }

    private start() {

        this.match_state = WS_Match_State.started_match;
        this.wait_timestamp = Date.now();
        this.wait_time = 0;

        this.send_state();

        this.eventCallback(MatchStatus.started, this);

        this.wait_to_next_round_start();

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

    private wait_to_abort(info?: string) {

        var self = this;
        this.matchInfo = info;

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
