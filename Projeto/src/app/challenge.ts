import { Round } from "./round";

export interface Challenge {

    key: string;
    name: string;
    ws_address:string;
    rounds: { [key: string]: Round };  
    
}


