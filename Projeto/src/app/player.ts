import { Score } from "./score";


export interface PlayerConfig {

    wait_to_start_time:number;

}


export interface Player {

    key: string;
    name:string;
    config:PlayerConfig;   
    scores:Score[];

}