import { Round } from "./round";
import { Score } from "./score";


export interface MatchConfig {

    show_options: boolean;
    start_match_upon_completing_registration: boolean;
    min_amount_players: number;
    max_amount_players: number;
    wait_to_registry_at_match_time:number;
    wait_to_start_match_time:number;   
    wait_to_shooting_time:number;
    wait_to_next_round_start_time:number;
    wait_to_round_resume_time:number;
    wait_to_match_abort_time:number;

}
export interface Match {

    key: string;
    name: string;
    config: MatchConfig;
    rounds: Round[];    

}


