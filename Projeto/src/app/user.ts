import { Match } from './match';
import { Quiz } from './quiz';

export class User {

    readonly name:string;
    readonly email:string;
    readonly password:string;
    readonly quizzes: { [key: string]: Quiz };
    readonly matches: { [key: string]: Match };

    constructor(
        name:string, 
        email:string, 
        password:string,  
        quizzes: { [key: string] : Quiz} = {}, 
        matches: { [key: string] : Match} = {}){

        this.name = name;
        this.email = email;
        this.password = password;
        this.quizzes = quizzes;
        this.matches = matches;

    }

    setQuiz(quiz:Quiz){
        this.quizzes[quiz.key] = quiz;
    }

    delQuiz(quiz_key:string){
        delete this.quizzes.quiz_key;
    }

}


// var umap = new Map<string,User>();
// umap.set("teste1", new User("user1", "user1@email", "1234"));
// umap.set("teste2", new User("user2", "user2@email", "1234"));
// console.log(umap);

// User.writeFile("./users.json", umap);

// const umap = User.readFile("./users.json");
// umap.set("teste3", new User("user3", "user3@email", "1234"));
// console.log(umap);