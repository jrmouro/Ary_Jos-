export const ScoreType = {
    response:"0", //respondeu e ganhou
    pass_response:"1",//não respondeu e ganhou quem passou
    response_pass:"2",// respondeu questão passada
    none:"3"
} as const;

export interface Score{
    scoretype:string;
    value:number;
}