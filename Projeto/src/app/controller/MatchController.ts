import { Request, Response } from "express";
import { User } from "../user";
import { Match } from "../match";
import { UID } from "../uid";
import { test_match } from "../test_match";
import { Data } from "../data";

class MatchController {

    public home(req: Request, res: Response) {
        // const port = req.query.wssport | 3000;
        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;

            // user_matches[UID.get()] = test_match;

            // Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));

            console.log(user_matches);

            res.render('match_home', {
                title: app_name,
                wsa: wsaddress,
                wsp: wsport,
                user: user,
                user_matches: user_matches,
                fail_msg: undefined
            });

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

       
    }

    public view(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const match_key: string = req.query.match_key as string;

            if (match_key !== undefined) {

                const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;

                res.render('match_view', {
                    title: app_name,
                    wsa: wsaddress,
                    wsp: wsport,
                    user: user,
                    user_matches: user_matches,
                    match_key: match_key,
                    fail_msg: undefined
                });

            } else {

                res.redirect('/match_home?fail_msg=invalid match_key');

            }           

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

   

}

export const matchController = new MatchController();