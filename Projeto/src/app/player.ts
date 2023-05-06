import { Score } from "./score";


export interface PlayerConfig {

    // wait_to_start_time:number;

}


export interface Player {

    key: string;
    name:string;
    avatar:number;
    config:PlayerConfig;   
    scores:Score[];

}