import { UID } from "./uid";





export class Question {

    key:string;
    description:string;
    fake_options:string[];
    true_option:string;

    constructor(description:string, true_option:string, fake_options:string[]){

        this.description = description;
        this.fake_options = fake_options;
        this.true_option = true_option;
        this.key = UID.get();
        
    }

}