import { Player } from "./player";
import { Question } from "./quiz";

export enum MatchMode{

    Multiplayer,
    SinglePlayer

}

export interface MatchConfig{

    timeout_question:Number;
    limit_pass_turn:Number;
    factor_pass_turn:Number;
    mode:MatchMode;

}

export class Match {

    name:string;
    theme:string;
    questions:Question[];
    players:Player[];

    constructor(name:string, theme:string, questions:Question[], players:Player[]){

        this.name = name;
        this.theme = theme;
        this.questions = questions;
        this.players = players;
        
    }

}