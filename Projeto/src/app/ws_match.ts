import { Match } from "./match";
import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Protocol } from "./protocol";
import { MatchStatus } from "./match_status";
import { Player } from "./player";
import { ScoreType } from "./score";

export class WS_Match {

    key: string;
    owner_user_key: string;
    match: Match;

    players: { [key: string]: Player } = {};

    player_response:string | undefined = undefined;
    player_pass:string | undefined = undefined;

    isRunning: boolean = false;
    isOpenToRegistry: boolean = true;
    isRoundShooting: boolean = false;
    isRoundResponse: boolean = false;
    isRoundpass: boolean = false;
    roundIndex: number = -1;

    // round_timeoutId: NodeJS.Timeout | undefined = undefined;
    shooting_timeoutId: NodeJS.Timeout | undefined = undefined;
    response_timeoutId: NodeJS.Timeout | undefined = undefined;
    pass_timeoutId: NodeJS.Timeout | undefined = undefined;
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

    private scoreboard(): { [key: string]: { name: string; score: number; } } {

        const sb: { [key: string]: { name: string; score: number } } = {};

        for (const player_key in this.players) {

            sb[player_key] = { name: this.players[player_key].name, score: 0 };

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

                //round
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
                    this.state(sender);
                    break;


            }

        }

    }

    point_pass(sender:string, content:{player_pointed:string;}){

        const player_pointed = content.player_pointed;        

        if(player_pointed in this.players && sender in this.players){

            if (this.pass_timeoutId !== undefined) {
                clearTimeout(this.pass_timeoutId);
                this.pass_timeoutId = undefined;
            }

            this.player_response = player_pointed;

            this.state();
        
            this.shooting_response(player_pointed, sender);            

        }

    }

    response(sender:string, content:{response:string;roundIndex:number;player_pass:string;}){

        if(this.isRoundResponse && this.roundIndex === content.roundIndex && sender in this.players){

            if (this.response_timeoutId !== undefined) {
                clearTimeout(this.response_timeoutId);
                this.response_timeoutId = undefined;
            }

            var score = this.match.rounds[content.roundIndex].score;

            if(this.match.rounds[content.roundIndex].question.true_option === content.response){

                if(content.player_pass !== undefined){

                    score *= 2;

                }

                this.players[sender].scores.push({
                    scoretype: ScoreType.pass,
                    value: score
                })

            } else {

                if(content.player_pass !== undefined){

                    this.players[content.player_pass].scores.push({
                        scoretype: ScoreType.pass,
                        value: score
                    })

                }

            }

            this.round_resume();

        }

    }

    wait_to_round_resume() {

        this.isRoundShooting = false;
        this.isRoundResponse = false;
        this.isRoundpass = false;

        var self = this;

        this.wait_to_round_resume_intervalId = setTimeout(() => {

                self.round();            

        }, this.match.config.wait_to_round_resume_time);

        this.state();

    }

    round_resume() {    
        
        //calcula

        this.state();

        this.wait_to_round_resume();

    }

    wait_to_shooting() {

        this.isRoundShooting = true;
        this.isRoundResponse = false;
        this.isRoundpass = false;
        this.player_response = undefined;
        this.player_pass = undefined;

        this.shooting_timeoutId = setTimeout(() => {

            var self = this;

            if (self.isRoundShooting) {

                self.round_resume();

            }

        }, this.match.rounds[this.roundIndex].shooting_timeout);

        this.state();

    }

    shooting_response(sender:string, player_pass:string | undefined = undefined) {

        if(this.isRoundShooting && sender in this.players){

            if (this.shooting_timeoutId !== undefined) {
                clearTimeout(this.shooting_timeoutId);
                this.shooting_timeoutId = undefined;
            }

            this.isRoundShooting = false;
            this.isRoundResponse = true;
            this.isRoundpass = false;
            this.player_pass = player_pass;
            this.player_response = sender;

            var self = this;
            this.response_timeoutId = setTimeout(() => {

                self.round_resume();   
                    
            }, this.match.rounds[this.roundIndex].response_timeout);

            this.state();

        }

    }

    

    shooting_pass(sender:string) {

        if(this.isRoundShooting && sender in this.players){

            if (this.shooting_timeoutId !== undefined) {
                clearTimeout(this.shooting_timeoutId);
                this.shooting_timeoutId = undefined;
            }

            this.isRoundShooting = false;
            this.isRoundResponse = false;
            this.isRoundpass = true;
            this.player_pass = sender;
            this.player_response = undefined;

            var self = this;
            this.response_timeoutId = setTimeout(() => {

                self.round_resume();   
                    
            }, this.match.rounds[this.roundIndex].pass_timeout);

            this.state();

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
                    msg_type: Protocol.match_state,
                    msg_content: {

                        state_flag: {
                            isRunning: this.isRunning,
                            isOpenToRegistry: this.isOpenToRegistry,
                            isRoundShooting: this.isRoundShooting,
                            isRoundResponse: this.isRoundResponse,
                            isRoundpass: this.isRoundpass,
                        },
                        
                        player_response: this.player_response,
                        player_pass: this.player_pass,
                        roundIndex: this.roundIndex,
                        scoreboard: this.scoreboard()

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

        // if (this.round_timeoutId !== undefined) {
        //     clearTimeout(this.round_timeoutId);
        //     this.round_timeoutId = undefined;
        // }

        if (this.shooting_timeoutId !== undefined) {
            clearTimeout(this.shooting_timeoutId);
            this.shooting_timeoutId = undefined;
        }

        if (this.wait_to_round_resume_intervalId !== undefined) {
            clearTimeout(this.wait_to_round_resume_intervalId);
            this.wait_to_round_resume_intervalId = undefined;
        }

        if (this.response_timeoutId!== undefined) {
            clearTimeout(this.response_timeoutId);
            this.response_timeoutId = undefined;
        }
        if (this.pass_timeoutId !== undefined) {
            clearTimeout(this.pass_timeoutId);
            this.pass_timeoutId = undefined;
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

        this.roundIndex++;

        if (this.roundIndex < this.match.rounds.length) {

            this.wait_to_shooting();

        } else {

            this.roundIndex = -1;

            this.end();

        }

    }

    private start() {

        // if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

        //     this.isRunning = true;

        //     this.socket.send(
        //         JSON.stringify({
        //             sender: this.key,
        //             sender_cluster: this.key,
        //             receiver: "__cluster__",
        //             receiver_cluster: this.key,
        //             msg_type: Protocol.match_start,
        //             msg_content: {}
        //         }));

        //     var self = this;

        //     this.eventCallback(MatchStatus.started, self);

        //     setTimeout(() => {

        //         self.round();

        //     }, 1000);

        // }

        this.isRunning = true;

        this.state()

        this.eventCallback(MatchStatus.started, this);

        var self = this;

        setTimeout(() => {

            self.round();

        }, 1000);

    }

    private wait_to_start() {

        // if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

        //     this.socket.send(
        //         JSON.stringify({
        //             sender: this.key,
        //             sender_cluster: this.key,
        //             receiver: "__cluster__",
        //             receiver_cluster: this.key,
        //             msg_type: Protocol.wait_to_start_match,
        //             msg_content: {}
        //         }));

        //     var self = this;

        //     this.wait_to_start_intervalId = setTimeout(() => {

        //         if (!self.isRunning && !self.isOpenToRegistry) {

        //             self.start();

        //         }

        //     }, self.match.config.wait_to_start_match_time);

        //     self.eventCallback(MatchStatus.wait_to_start, self);

        // }

        this.isOpenToRegistry = false;

        var self = this;

        this.wait_to_start_intervalId = setTimeout(() => {

            if (!self.isRunning && !self.isOpenToRegistry) {

                self.start();

            }

        }, self.match.config.wait_to_start_match_time);

        this.state();

        self.eventCallback(MatchStatus.wait_to_start, self);

    }

    private wait_to_registry() {

        var self = this;

        this.wait_to_registry_intervalId = setTimeout(() => {

            if (!self.isRunning && self.isOpenToRegistry) {

                if (Object.keys(this.players).length < self.match.config.min_amount_players) {

                    self.failure(undefined, "no min amount players");

                    self.end("no min amount players");

                    return;

                } else {

                    self.isOpenToRegistry = false;

                    self.wait_to_start();

                }

            }

        }, self.match.config.wait_to_registry_at_match_time);

        this.state();

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
        
        this.roundIndex = -1;
        this.isRunning = this.isOpenToRegistry = this.isRoundResponse = this.isRoundShooting = this.isRoundpass = false;
        this.state();
        this.eventCallback(MatchStatus.finished, this);

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
