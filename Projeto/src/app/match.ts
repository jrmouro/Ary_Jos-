import { Round } from "./round";
import { Score } from "./score";


export interface MatchConfig {

    show_options: boolean;
    min_amount_players: number;
    max_amount_players: number;
    wait_to_registry_at_match_time:number;
    wait_to_start_match_time:number;
    wait_to_shooting_time:number;
    wait_to_round_resume_time:number;

}


export interface Match {

    key: string;
    name: string;
    config: MatchConfig;
    rounds: Round[];
    Keyplayer_score_map: Map<string, Score[]>;

    

}


