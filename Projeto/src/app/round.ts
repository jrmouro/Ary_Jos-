import { Question } from "./question";

export interface Round {

    key: string;
    quiz_theme: string;
    question: Question;
    shooting_timeout: number;
    response_timeout: number;
    pass_timeout: number;
    score: number;

}