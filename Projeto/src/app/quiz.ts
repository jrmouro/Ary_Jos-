import { Question } from "./question";
import { UID } from "./uid";

export class Quiz {

    key: string;
    name: string; // id
    theme: string;
    questions: { [key: string]: Question };

    constructor(name: string, theme: string, questions: { [keys: string]: Question } = {}) {

        this.name = name;
        this.theme = theme;
        this.questions = questions;
        this.key = UID.get();

    }

    set(question:Question){
        this.questions[question.key] = question;
    }

    del(question_key:string){
        delete this.questions.question_key;
    }


}

const q1: Question = new Question("Quanto é 1 + 1?",  '2', ['0', '1', '3']);
const q2: Question = new Question("Quanto é 1 - 1?", '0', ['1', '2', '3']);
const q3: Question = new Question("Quanto é 1 * 1?",  '1', ['0', '2', '3']);
const q4: Question = new Question("Quanto é 1 / 1?",  '1', ['0', '2', '3']);

const arithmetic_quiz: Quiz = new Quiz(
    "Arithmetic", 
    'arithmetic with number one');

arithmetic_quiz.set(q1);
arithmetic_quiz.set(q2);
arithmetic_quiz.set(q3);
arithmetic_quiz.set(q4);




export { arithmetic_quiz };