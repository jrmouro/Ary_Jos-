import { Match, MatchConfig } from "./match";
import { Round } from "./round";
import { UID } from "./uid";

const config:MatchConfig = {
    show_options: false,
    min_amount_players: 1,
    max_amount_players: 2,
    wait_to_registry_at_match_time: 240000,
    wait_to_start_match_time: 15000,
    wait_to_shooting_time: 5000,
    wait_to_round_resume_time: 5000
}

const rounds:Round[] = [

    {
        key: UID.get(),
        quiz_theme: "arithmetic",
        question:{
            key: UID.get(),
            description: "2 + 2 = 4",
            fake_options: ["false"],
            true_option: "true"
        },
        response_timeout: 10000,
        pass_timeout: 10000,
        score: 10    
    },

    {
        key: UID.get(),
        quiz_theme: "typescript",
        question:{
            key: UID.get(),
            description: "how to declare a variable in typescript language?",
            fake_options: ["var id;", "type id;", "id:type;"],
            true_option: "var id:type;"
        },
        response_timeout: 10000,
        pass_timeout: 10000,
        score: 10    
    },


]

export const test_match:Match = {
    key: "test_match",
    name: "Test Match",
    config: config,
    rounds: rounds,
    Keyplayer_score_map: new Map()
};