import * as fs from 'fs';
import { User } from './user';
// import { User } from './user';

export class Data {


    static readFileSync<T>(path: string): { [key: string]: T } {

        if (fs.existsSync(path)) {

            const strfile = fs.readFileSync(path, 'utf-8');
            // return new Map(Object.entries(JSON.parse(strfile)));
            return JSON.parse(strfile);
        }

        // return new Map<string, T>();
        return {};

    }

    static writeFileSync<T>(path: string, obj: { [key: string]: T }) {

        const json = JSON.stringify(obj);
        fs.writeFileSync(path, json);

    }

    static writeFile<T>(path: string, obj: { [key: string]: T }) {

        const json = JSON.stringify(obj);
        fs.writeFile(path, json, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });

    }

}

// const user:User = new User("admin","admin@passorpass.com", "admin");
// const obj: { [key: string]: User } = {};
// obj[user.email] = user;

// Data.writeFileSync<User>("./users.json", obj) 
// const umap = Data.readFileSync<User>("./users.json");
// umap["teste"] = user;
// console.log(umap);