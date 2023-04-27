import { Request, Response } from "express";
import { User } from "../user";
import { Match } from "../match";
import { UID } from "../uid";
import { test_match } from "../test_match";
import { Data } from "../data";
import { WS_Match } from "../ws_match";
import { MatchStatus } from "../match_status";
import { WS_MatchInfo } from "../ws_match_info";

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

    public launch(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const match_key: string = req.query.match_key as string;
            const match_name: string = req.query.match_name as string || "nameless match";

            if (match_key !== undefined) {

                const wsmatchinfo:WS_MatchInfo = req.app.get("app_ws_match_info_client") as WS_MatchInfo;

                const match:Match = req.app.get("app_user_data_map")[user.email].matches[match_key];

                const wsmatchkey = UID.get();

                const wsmatch: WS_Match = new WS_Match(wsmatchkey, match, (ev:string, wsmatch:WS_Match)=>{

                    switch(ev){

                        case MatchStatus.aborted:

                            req.app.get("app_launched_matches").delete(wsmatchkey);    

                        case MatchStatus.started:
                        case MatchStatus.finished:                 
                        case MatchStatus.wait_to_registry:

                            wsmatchinfo.setInfo({
                                name: match_name,
                                key: match_key,
                                status: ev
                            });

                            break;

                        
                    }

                });

                req.app.get("app_launched_matches").set(wsmatchkey, wsmatch);

                wsmatch.launch(req.app.get("app_web_server_address"), req.app.get("app_websockt_server_port"));

                res.redirect('/');
                
            } else {

                res.redirect('/match_view?fail_msg=invalid match_key');

            }           

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }


   

}

export const matchController = new MatchController();