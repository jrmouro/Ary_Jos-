import { Round } from "./round";

export interface Challenge {

    key: string;
    name: string;
    rounds: { [key: string]: Round };  
    
}


