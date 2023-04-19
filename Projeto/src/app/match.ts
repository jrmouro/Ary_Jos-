import { Round } from "./round";


export interface MatchConfig {

    show_options: boolean;
    min_amount_players: number;
    max_amount_players: number;
    wait_to_start_time:number;
    msg_status_interval:number;

}


export interface Match {

    key: string;
    name: string;
    config: MatchConfig;
    rounds: Round[];
    Keyplayer_score_map: Map<string, number>
    Keyplayer_name_map: Map<string, string>

}


