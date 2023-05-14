export const Round_State_Value = {

    next:-1,
    wait_shooting: 0,
    wait_response: 1,
    wait_pass: 2,
    wait_pass_response: 3,
    right_response: 4,
    wrong_response: 5,
    right_pass_response: 6,
    wrong_pass_response: 7,
    shooting_pass: 8,
    shooting_response: 9,
    pass: 10

} as const;

export interface _Round_State {
    state_value: number;
    round_index: number;
    player_response: string | undefined;
    player_pass: string | undefined;
    round_response: string | undefined;
};

export abstract class Round_State implements _Round_State {
    state_value: number;
    round_index: number;
    player_response: string | undefined;
    player_pass: string | undefined;
    round_response: string | undefined;
    constructor(
        state_value: number,
        round_index: number = -1,
        player_response: string | undefined = undefined,
        player_pass: string | undefined = undefined,
        round_response: string | undefined = undefined) {
        this.state_value = state_value;
        this.round_index = round_index;
        this.player_response = player_response;
        this.player_pass = player_pass;
        this.round_response = round_response;
    }
}

export class Next_State extends Round_State {
    constructor(
        round_index: number) {
        super(Round_State_Value.next, round_index);
    }
}

export class Wait_Shooting_State extends Round_State {
    constructor(
        round_index: number) {
        super(Round_State_Value.wait_shooting, round_index);
    }
}

export class Wait_Response_State extends Round_State {
    constructor(
        round_index: number,
        player_response: string | undefined) {
        super(Round_State_Value.wait_response, round_index, player_response);
    }
}

export class Wait_Pass_State extends Round_State {
    constructor(
        round_index: number,
        player_pass: string | undefined) {
        super(Round_State_Value.wait_pass, round_index, undefined, player_pass);
    }
}

export class Wait_Pass_Response_State extends Round_State {
    constructor(
        round_index: number,
        player_response:string,
        player_pass: string) {
        super(Round_State_Value.wait_pass_response, round_index, player_response, player_pass);
    }
}

export class Right_Response_State extends Round_State {
    constructor(
        round_index: number,
        player_response:string,
        round_response: string) {
        super(Round_State_Value.right_response, round_index, player_response, undefined, round_response);
    }
}

export class Wrong_Response_State extends Round_State {
    constructor(
        round_index: number,
        player_response:string,
        round_response: string) {
        super(Round_State_Value.wrong_response, round_index, player_response, undefined, round_response);
    }
}

export class Right_Pass_Response_State extends Round_State {
    constructor(
        round_index: number,
        player_response:string,
        player_pass: string,
        round_response: string) {
        super(Round_State_Value.right_pass_response, round_index, player_response, player_pass, round_response);
    }
}

export class Wrong_Pass_Response_State extends Round_State {
    constructor(
        round_index: number,
        player_response:string,
        player_pass: string,
        round_response: string) {
        super(Round_State_Value.wrong_pass_response, round_index, player_response, player_pass, round_response);
    }
}

export class Shooting_Pass_State extends Round_State {
    constructor(
        round_index: number,
        player_pass: string) {
        super(Round_State_Value.shooting_pass, round_index, undefined, player_pass);
    }
}

export class Shooting_Response_State extends Round_State {
    constructor(
        round_index: number,
        player_response:string) {
        super(Round_State_Value.shooting_response, round_index, player_response);
    }
}

export class Pass_State extends Round_State {
    constructor(
        round_index: number,
        player_response:string,
        player_pass: string) {
        super(Round_State_Value.pass, round_index, player_response, player_pass);
    }
}