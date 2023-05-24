export const ChallengeStatus = {
    
    wait_to_registry: "0",
    wait_to_start: "1",
    started: "2",
    ended: "3",
    launched: "4",
    registry: "5",
    aborted: "6",
    failure: "7",
    opened_socket: "8",
    closed_socket: "9",
    error_socket: "X"



} as const;