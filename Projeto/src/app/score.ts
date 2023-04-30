export const ScoreType = {
    response:"0",
    pass:"1",
    none:"2"
} as const;

export interface Score{
    scoretype:string;
    value:number;
}