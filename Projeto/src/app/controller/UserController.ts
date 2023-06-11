import { Request, Response } from "express";
import { User } from "../user";
import { Data } from "../data";
import crypto from "crypto-js";
import { v4 as uuidv4 } from 'uuid';

class UserController {

    public register_form(req: Request, res: Response) {
        // const port = req.query.wssport | 3000;
        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        res.render('user_register_form', {
            title: app_name,
            wsa: wsaddress,
            wsp: wsport
        });

    }

    public register(req: Request, res: Response) {
        
        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        let key = uuidv4();

        if (req.query.name !== undefined) {

            if(req.query.password != undefined) {

                let original_password = req.query.password.toString();
                let encrypted_password = crypto.AES.encrypt(original_password, key).toString();

                const user: User = new User(
                    req.query.name as string, 
                    req.query.email  as string, 
                    encrypted_password  as string,
                    key as string);
    
                req.app.get("app_user_data_map")[req.query.email as string] = user;
                Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));
            }
        }

        res.redirect('/user_login_form');

    }

    public login(req: Request, res: Response) {
        
        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const email:string = req.query.email as string;

        if (email in req.app.get("app_user_data_map")) {

            const user: User = req.app.get("app_user_data_map")[email];

            let decrypted_password = crypto.AES.decrypt(user.password, user.key_password).toString(crypto.enc.Utf8);

            if (decrypted_password === req.query.password as string) {
    
                req.app.get("users_session_login").set(req.session.id, user);
    
                console.log("LOGIN");
                console.log(req.query);
    
                res.redirect('/');
    
            } else {

                    res.redirect('/user_login_form?fail_msg=user login fail');
        
            }  

        } else {

            res.redirect('/user_login_form?fail_msg=user login fail');

        }

    }

    public login_form(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const fail_msg = req.query.fail_msg;

        res.render('user_login_form', {
            title: app_name,
            wsa: wsaddress,
            wsp: wsport,
            fail_msg: fail_msg,
            user: undefined
        });

    }

    public logout(req: Request, res: Response) {
        
        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        req.app.get("users_session_login").delete(req.session.id);

        res.redirect('/');

    }

}

export const userController = new UserController();