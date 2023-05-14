import { WS_Match } from "./ws_match";
import { Player } from "./player";
import { MatchStatus } from "./match_status";
import WebSocket, { MessageEvent } from "ws";
import { Shooting_Pass_State, Right_Pass_Response_State, Right_Response_State, Wait_Response_State, Wait_Shooting_State, Wrong_Pass_Response_State, Wrong_Response_State, _Round_State, Shooting_Response_State, Pass_State, Next_State, Wait_Pass_State, Wait_Pass_Response_State } from "./round_state";


export const WS_Match_State_Value = {

    unlaunched_match: -1,
    wait_to_registry_match: 1,
    wait_to_start_match: 4,
    started_match: 5,
    next_round: 7,
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

export interface _WS_Match_State {

    state_value: number;
    round_state: _Round_State | undefined;
    timeout: NodeJS.Timer | undefined;
    wait_time: number;
    wait_timestamp: number;

    launch: () => void;
    register: (player: Player) => void;
    shot_response: (roundIndex: number, player_response: string) => void;
    shot_pass: (roundIndex: number, player_pass: string) => void;
    response: (round_index: number, player_response: string, player_pass: string, response_round: string) => void;
    pass: (roundIndex: number, player_response: string, player_pass: string) => void;
    unregister: () => void;
    abort: () => void;
    update_time: () => void;

    follow: () => void;

};

export abstract class WS_Match_State implements _WS_Match_State {

    state_value: number;
    round_state: _Round_State | undefined;
    timeout: NodeJS.Timer | undefined = undefined;
    wait_time: number = 0;
    wait_timestamp: number = Date.now();

    constructor(state_value: number, protected ws_match: WS_Match, round_state: _Round_State | undefined = undefined) {
        this.state_value = state_value;
        this.round_state = round_state;
    }

    launch() { }
    register(player: Player) { }
    response(round_index: number, player_response: string, player_pass: string, response_round: string) { }
    pass(roundIndex: number, player_response: string, player_pass: string) { }
    unregister() { }
    shot_response(roundIndex: number, player_response: string) { }
    shot_pass(roundIndex: number, player_pass: string) { }

    abort() {

        this.ws_match.set_state(new Aborted_Match_State(this.ws_match));

        if (this.timeout !== undefined) {

            clearTimeout(this.timeout);

        }

    }

    update_time() {

        this.wait_time = Math.max(0, this.wait_time - (Date.now() - this.wait_timestamp));

    }

    abstract follow(): void;


}

export class Unlaunched_Match_State extends WS_Match_State {

    constructor(ws_match: WS_Match) {
        super(WS_Match_State_Value.unlaunched_match, ws_match);
    }

    launch(): void {

        this.ws_match.set_state(new Wait_to_Registry_Match_State(this.ws_match));

    }

    follow(): void { }

}

export class Next_Round_State extends WS_Match_State {

    constructor(ws_match: WS_Match, round_state: _Round_State) {

        super(WS_Match_State_Value.next_round, ws_match, round_state);

    }

    follow(): void {

        if (this.round_state !== undefined && this.round_state.round_index < this.ws_match.match_round_entries.length) {

            if (Object.keys(this.ws_match.players).length === 1) {

                var player = Object.keys(this.ws_match.players)[0];

                this.ws_match.set_state(
                    new Wait_to_Response_Round(
                        this.ws_match,
                        new Wait_Response_State(
                            this.round_state.round_index,
                            player)));

            } else {

                this.ws_match.set_state(
                    new Wait_to_Shooting_Round(
                        this.ws_match,
                        new Wait_Shooting_State(this.round_state.round_index)));

            }

        } else {

            this.ws_match.set_state(new Wait_to_End_Match(this.ws_match));

        }

    }


}


export class Wait_to_Response_Round extends WS_Match_State {

    constructor(ws_match: WS_Match, round_state: _Round_State) {

        super(WS_Match_State_Value.wait_to_response_round, ws_match, round_state);

        this.wait_time = this.ws_match.match_round_entries[round_state.round_index][1].response_timeout;

    }

    follow(): void {

        if (this.round_state !== undefined) {

            var self = this;

            this.timeout = setTimeout(() => {

                self.ws_match.set_state(new Wait_to_Resume_Round(self.ws_match, self.round_state!));

            }, this.ws_match.match_round_entries[this.round_state.round_index][1].response_timeout);

        }

    }

    response(round_index: number, player_response: string, player_pass: string, round_response: string): void {

        if (round_index === this.round_state?.round_index
            && player_response in this.ws_match.players) {

            clearTimeout(this.timeout);

            if (player_pass !== undefined) {

                if (round_response === this.ws_match.match_round_entries[round_index][1].question.true_option) {




                    this.ws_match.set_state(new Response_Round_State(
                        this.ws_match,
                        new Right_Pass_Response_State(
                            round_index,
                            player_response,
                            player_pass,
                            round_response)));

                } else {

                    this.ws_match.set_state(new Response_Round_State(
                        this.ws_match,
                        new Wrong_Pass_Response_State(
                            round_index,
                            player_response,
                            player_pass,
                            round_response)));

                }

            } else {

                if (round_response === this.ws_match.match_round_entries[round_index][1].question.true_option) {



                    this.ws_match.set_state(new Response_Round_State(
                        this.ws_match,
                        new Right_Response_State(
                            round_index,
                            player_response,
                            round_response)));

                } else {

                    this.ws_match.set_state(new Response_Round_State(
                        this.ws_match,
                        new Wrong_Response_State(
                            round_index,
                            player_response,
                            round_response)));


                }

            }

        }

    }

}

export class Response_Round_State extends WS_Match_State {

    constructor(ws_match: WS_Match, round_state: _Round_State) {

        super(WS_Match_State_Value.response_round, ws_match, round_state);

    }

    follow(): void {

        this.ws_match.set_state(new Wait_to_Resume_Round(this.ws_match, this.round_state!));

    }

}

export class Round_Resume_State extends WS_Match_State {

    constructor(ws_match: WS_Match, round_state: _Round_State) {

        super(WS_Match_State_Value.resume_round, ws_match, round_state);


    }

    follow(): void {

        if (this.round_state!.round_index < this.ws_match.match_round_entries.length - 1) {

            this.ws_match.set_state(new Next_Round_State(this.ws_match, new Next_State(this.round_state!.round_index + 1)));

        } else {

            this.ws_match.set_state(new Wait_to_End_Match(this.ws_match));

        }

    }

}

export class Wait_to_Resume_Round extends WS_Match_State {

    constructor(ws_match: WS_Match, round_state: _Round_State) {

        super(WS_Match_State_Value.wait_to_resume_round, ws_match, round_state);

        this.wait_time = this.ws_match.match.config.wait_to_round_resume_time;

        this.ws_match.score();

    }

    follow(): void {

        var self = this;

        this.timeout = setTimeout(() => {

            self.ws_match.set_state(new Round_Resume_State(self.ws_match, self.round_state!));

        }, this.ws_match.match.config.wait_to_round_resume_time);

    }

}

export class Wait_to_Shooting_Round extends WS_Match_State {

    constructor(ws_match: WS_Match, round_state: _Round_State) {

        super(WS_Match_State_Value.wait_to_shooting_round, ws_match, round_state);

        this.wait_time = this.ws_match.match_round_entries[this.round_state!.round_index][1].shooting_timeout;

    }

    follow(): void {

        var self = this;
        this.timeout = setTimeout(() => {

            self.ws_match.set_state(new Wait_to_Resume_Round(self.ws_match, self.round_state!));

        }, this.ws_match.match_round_entries[this.round_state!.round_index][1].shooting_timeout);

    }

    shot_response(roundIndex: number, player_response: string) {

        if (roundIndex === this.round_state?.round_index
            && player_response in this.ws_match.players) {

            clearTimeout(this.timeout);

            this.ws_match.set_state(new Wait_to_Response_Round(
                            this.ws_match,
                            new Wait_Response_State(
                                roundIndex,
                                player_response)));

        }

    }

    shot_pass(roundIndex: number, player_pass: string) {

        if (roundIndex === this.round_state?.round_index
            && player_pass in this.ws_match.players) {

            clearTimeout(this.timeout);

            if (Object.entries(this.ws_match.players).length == 2) {

                for (const player in this.ws_match.players) {

                    if (player != player_pass) {

                        this.ws_match.set_state(new Wait_to_Response_Round(
                            this.ws_match,
                            new Wait_Pass_Response_State(
                                roundIndex,
                                player,
                                player_pass)));

                        break;

                    }

                }

            } else {

                this.ws_match.set_state(new Wait_to_Pass_Round(
                    this.ws_match,
                    new Wait_Pass_State(
                        roundIndex,
                        player_pass)));

            }

        }

    }

}

export class Wait_to_Pass_Round extends WS_Match_State {

    constructor(ws_match: WS_Match, round_state: _Round_State) {

        super(WS_Match_State_Value.wait_to_pass_round, ws_match, round_state);

        this.wait_time = this.ws_match.match_round_entries[round_state.round_index][1].pass_timeout;

    }

    follow(): void {

        var self = this;
        this.timeout = setTimeout(() => {

            self.ws_match.set_state(new Wait_to_Resume_Round(self.ws_match, self.round_state!));

        }, this.ws_match.match_round_entries[this.round_state!.round_index][1].pass_timeout);



    }

    pass(roundIndex: number, player_response: string, player_pass: string): void {

        if (roundIndex === this.round_state?.round_index
            && player_response in this.ws_match.players
            && player_pass in this.ws_match.players) {

            clearTimeout(this.timeout);

            this.ws_match.set_state(new Wait_to_Response_Round(
                this.ws_match,
                new Pass_State(
                    roundIndex,
                    player_response,
                    player_pass)));

        }

    }

}

export class Wait_to_End_Match extends WS_Match_State {

    constructor(ws_match: WS_Match) {

        super(WS_Match_State_Value.wait_to_end_match, ws_match);

        this.wait_time = this.ws_match.match.config.wait_to_match_end_time;

    }

    follow(): void {

        var self = this;
        this.timeout = setTimeout(() => {

            self.ws_match.set_state(new Ended_Match_State(self.ws_match));

        }, this.ws_match.match.config.wait_to_match_end_time);


    }

}

export class Ended_Match_State extends WS_Match_State {

    constructor(ws_match: WS_Match) {

        super(WS_Match_State_Value.ended_match, ws_match);

    }

    follow(): void {

        this.ws_match.eventCallback(MatchStatus.ended, this.ws_match);

        this.ws_match.set_state(new Wait_to_Abort_Match_State(this.ws_match));

    }


}

export class Wait_to_Abort_Match_State extends WS_Match_State {

    constructor(ws_match: WS_Match) {

        super(WS_Match_State_Value.wait_to_abort_match, ws_match);

        this.wait_time = ws_match.match.config.wait_to_match_abort_time;



    }

    follow(): void {

        var self = this;
        this.timeout = setTimeout(() => {

            self.ws_match.set_state(new Aborted_Match_State(self.ws_match));

        }, this.ws_match.match.config.wait_to_match_abort_time);

    }


}

export class Wait_to_Start_Match_State extends WS_Match_State {

    constructor(ws_match: WS_Match) {

        super(WS_Match_State_Value.wait_to_start_match, ws_match);

        this.wait_time = ws_match.match.config.wait_to_start_match_time;

    }

    follow(): void {

        var self = this;
        this.timeout = setTimeout(() => {

            self.ws_match.set_state(new Started_Match_State(self.ws_match));

        }, this.ws_match.match.config.wait_to_start_match_time);

        this.ws_match.eventCallback(MatchStatus.wait_to_start, this.ws_match);

    }

}

export class Started_Match_State extends WS_Match_State {

    constructor(ws_match: WS_Match) {

        super(WS_Match_State_Value.started_match, ws_match);

    }

    follow(): void {

        this.ws_match.eventCallback(MatchStatus.started, this.ws_match);

        if (this.ws_match.match_round_entries.length > 0) {

            this.ws_match.set_state(new Next_Round_State(this.ws_match, new Next_State(0)));

        } else {

            this.ws_match.set_state(new Wait_to_End_Match(this.ws_match));

        }

    }

}

export class Aborted_Match_State extends WS_Match_State {

    constructor(ws_match: WS_Match) {

        super(WS_Match_State_Value.aborted_match, ws_match);

    }

    follow(): void {

        if (this.ws_match.socket !== undefined && this.ws_match.socket.readyState === WebSocket.OPEN) {

            this.ws_match.socket.close(1000, "aborted ws_match " + this.ws_match.match.name);

        }

        this.ws_match.eventCallback(MatchStatus.aborted, this.ws_match);

    }

}


export class Wait_to_Registry_Match_State extends WS_Match_State {

    constructor(ws_match: WS_Match) {

        super(WS_Match_State_Value.wait_to_registry_match, ws_match)

        this.wait_time = ws_match.match.config.wait_to_registry_at_match_time;

    }

    follow(): void {

        var self = this;
        this.timeout = setTimeout(() => {

            if (Object.keys(self.ws_match.players).length < self.ws_match.match.config.min_amount_players) {

                this.ws_match.set_state(new Wait_to_Abort_Match_State(self.ws_match));

            } else {

                this.ws_match.set_state(new Wait_to_Start_Match_State(self.ws_match));

            }

        }, this.ws_match.match.config.wait_to_registry_at_match_time);

        // ws_match.send_state();

        this.ws_match.eventCallback(MatchStatus.wait_to_registry, this.ws_match);

    }

    register(player: Player) {

        if (Object.keys(this.ws_match.players).length < this.ws_match.match.config.max_amount_players) {

            this.ws_match.players[player.key] = player;

            const isOpenToRegistry = Object.keys(this.ws_match.players).length < this.ws_match.match.config.max_amount_players;

            // this.wait_time = Math.max(0, this.wait_time - (Date.now() - this.wait_timestamp));

            // this.ws_match.send_state();

            if (!isOpenToRegistry && this.ws_match.match.config.start_match_upon_completing_registration) {

                clearTimeout(this.timeout);

                this.ws_match.set_state(new Wait_to_Start_Match_State(this.ws_match));

            } else {

                this.ws_match.set_state(this, true, false);

            }

        }

    }

}