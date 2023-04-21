export enum ScoreType{
    shot_response,
    shot_pass
}

export interface Score{
    scoretype:ScoreType;
    value:number;
}