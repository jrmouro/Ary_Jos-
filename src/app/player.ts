import { User } from "./user";

export class Player {

    user:User;
    score:Number;

    constructor(user:User, score:Number = 0){

        this.user = user;
        this.score = score;
        
    }

}