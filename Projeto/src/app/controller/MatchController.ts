import { Request, Response } from "express";
import { User } from "../user";
import { Match, MatchConfig } from "../match";
import { UID } from "../uid";
import { WS_Match } from "../ws_match";
import { MatchStatus } from "../match_status";
import { WS_MatchInfo } from "../ws_match_info";
import { Data } from "../data";

class MatchController {

    public home(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const wss_port = req.app.get("app_websockt_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const wsmatchinfo: WS_MatchInfo = req.app.get("app_ws_match_info_client") as WS_MatchInfo;

            const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;

            res.render('match_home', {
                title: app_name,
                wsa: wsaddress,
                wsp: wsport,
                wssp: wss_port,
                user: user,
                user_matches: user_matches,
                wsmatchinfoclusterkey: wsmatchinfo.key,
                wsmatchinfokey: UID.get(),
                fail_msg: undefined
            });

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }


    }

    public register(req: Request, res: Response) {
        // const port = req.query.wssport | 3000;
        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const name: string = req.query.name as string;



            const config: MatchConfig = {
                show_options: req.query.checkbox1 ? true : false,
                start_match_upon_completing_registration: req.query.checkbox2 ? true : false,
                min_amount_players:  parseInt(req.query.quantity1 as string),
                max_amount_players:  parseInt(req.query.quantity2 as string),
                wait_to_registry_at_match_time:  1000 * parseInt(req.query.quantity3 as string),
                wait_to_start_match_time:  1000 * parseInt(req.query.quantity4 as string),
                // wait_to_shooting_time: parseInt(req.query.quantity5 as string),
                wait_to_next_round_start_time:  1000 * parseInt(req.query.quantity6 as string),
                wait_to_round_resume_time:  1000 * parseInt(req.query.quantity7 as string),
                wait_to_match_end_time:  1000 * parseInt(req.query.quantity8 as string),
                wait_to_match_abort_time:  1000 * parseInt(req.query.quantity9 as string),
                avatares: [
                    128120,128121,128122,128125,128126,128118,128113,128102,128103,
                    128063,128048,128045,128511,129302,127875,127877,128010,128012,
                    128018,128027,128030,128034,128035,128045,128047,128128,128373,
                    128574]
            }

            const match: Match = {
                key: UID.get(),
                name: name,
                config: config,
                rounds: {}
            }

            const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;
            user_matches[match.key] = match;

            Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));

            res.redirect('/match_edit_form?match_key='+ match.key);

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    public edit(req: Request, res: Response) {
        
        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const match_key: string = req.query.match_key as string;
            const name: string = req.query.name as string;

            if( match_key in req.app.get("app_user_data_map")[user.email].matches){

                req.app.get("app_user_data_map")[user.email].matches[match_key].name = name;

                req.app.get("app_user_data_map")[user.email].matches[match_key].config.show_options = req.query.checkbox1 ? true : false;
                req.app.get("app_user_data_map")[user.email].matches[match_key].config.start_match_upon_completing_registration = req.query.checkbox2 ? true : false;
                req.app.get("app_user_data_map")[user.email].matches[match_key].config.min_amount_players = parseInt(req.query.quantity1 as string);
                req.app.get("app_user_data_map")[user.email].matches[match_key].config.max_amount_players =  parseInt(req.query.quantity2 as string);
                req.app.get("app_user_data_map")[user.email].matches[match_key].config.wait_to_registry_at_match_time =  1000 * parseInt(req.query.quantity3 as string);
                req.app.get("app_user_data_map")[user.email].matches[match_key].config.wait_to_start_match_time =  1000 * parseInt(req.query.quantity4 as string);
                // req.app.get("app_user_data_map")[user.email].matches[match_key].config.wait_to_shooting_time = parseInt(req.query.quantity5 as string);
                req.app.get("app_user_data_map")[user.email].matches[match_key].config.wait_to_next_round_start_time =  1000 * parseInt(req.query.quantity6 as string);
                req.app.get("app_user_data_map")[user.email].matches[match_key].config.wait_to_round_resume_time =  1000 * parseInt(req.query.quantity7 as string);
                req.app.get("app_user_data_map")[user.email].matches[match_key].config.wait_to_match_end_time =  1000 * parseInt(req.query.quantity8 as string);
                req.app.get("app_user_data_map")[user.email].matches[match_key].config.wait_to_match_abort_time =  1000 * parseInt(req.query.quantity9 as string);

                Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));

                res.redirect('/match_edit_form?match_key='+ match_key);

            } else {

                res.redirect('/user_login_form?fail_msg=invalid match_key');

            }

            

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    public edit_form(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const match_key: string = req.query.match_key as string;

            if (match_key !== undefined) {

                const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;

                if (match_key in user_matches) {

                    const edit_quiz: Match = user_matches[match_key];

                    res.render('match_edit_form', {
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

                res.redirect('/match_home?fail_msg=match_key is required');

            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    public register_form(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;

            res.render('match_register_form', {
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

    public room(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const wss_port = req.app.get("app_websockt_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);
        const fail_msg = req.query.fail_msg;

        if (user !== undefined) {

            const ws_match_key: string = req.query.ws_match_key as string; 
            const owner_user_key: string = req.query.ws_match_owner_user_key as string;

            if (ws_match_key !== undefined && owner_user_key !== undefined) {

                if (req.app.get("app_launched_matches").has(owner_user_key)) {

                    const wsmatch = req.app.get("app_launched_matches").get(owner_user_key).get(ws_match_key) as WS_Match;
                    
                    if (wsmatch !== undefined) {

                        res.render('match_room', {
                            title: app_name,
                            wsa: wsaddress,
                            wsp: wsport,
                            wssp: wss_port,
                            user: user,
                            match: wsmatch.match,
                            ws_match_cluster_key: wsmatch.key,
                            ws_match_owner_user_key: wsmatch.owner_user_key,
                            ws_match_player_key: user.email,
                            ws_match_player_name: user.name,
                            fail_msg: fail_msg
                        });

                    } else {

                        res.redirect('/?fail_msg=invalid ws_match_key');

                    }

                } else {

                    res.redirect('/?fail_msg=invalid owner_user_key');

                }



            } else {

                res.redirect('/?fail_msg=ws_match_key or owner_user_key not provided');

            }

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

    public register_player(req: Request, res: Response) {

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const ws_match_key: string = req.query.ws_match_key as string;
            const owner_user_key: string = req.query.ws_match_owner_user_key as string;
            const player_avatar: number = parseInt(req.query.player_avatar as string);

            if (ws_match_key !== undefined && owner_user_key !== undefined) {

                if (req.app.get("app_launched_matches").has(owner_user_key)) {

                    const wsmatch = req.app.get("app_launched_matches").get(owner_user_key).get(ws_match_key) as WS_Match;

                    if (wsmatch !== undefined) {

                        const regok = wsmatch.register({
                            key: user.email,
                            name: user.name,
                            avatar: player_avatar || 128120,
                            config: {},
                            scores: []
                        });

                        if (regok) {

                            const wsmatchinfo: WS_MatchInfo = req.app.get("app_ws_match_info_client") as WS_MatchInfo;

                            wsmatchinfo.setInfo({
                                name: wsmatch.match.name,
                                key: wsmatch.key,
                                status: MatchStatus.registry,
                                owner_user_key: wsmatch.owner_user_key,
                                players: wsmatch.players
                            });

                            res.redirect("/match_room?ws_match_key=" + wsmatch.key + "&ws_match_owner_user_key=" + wsmatch.owner_user_key);

                        } else {

                            res.redirect('/?fail_msg=no possible to register for match');

                        }

                    } else {

                        res.redirect('/?fail_msg=invalid ws_match_key');

                    }

                } else {

                    res.redirect('/?fail_msg=invalid ws_match_owner_user_key');

                }

            } else {

                res.redirect('/?fail_msg=no provided ws_match_key or ws_match_owner_user_key');

            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    public unregister_player(req: Request, res: Response) {

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const ws_match_key: string = req.query.ws_match_key as string;
            const owner_user_key: string = req.query.ws_match_owner_user_key as string;

            if (ws_match_key !== undefined && owner_user_key !== undefined) {

                if (req.app.get("app_launched_matches").has(owner_user_key)) {

                    const wsmatch = req.app.get("app_launched_matches").get(owner_user_key).get(ws_match_key) as WS_Match;

                    if (wsmatch !== undefined) {

                        const regok = wsmatch.unregister(user.email);

                        if (regok) {

                            const wsmatchinfo: WS_MatchInfo = req.app.get("app_ws_match_info_client") as WS_MatchInfo;

                            wsmatchinfo.setInfo({
                                name: wsmatch.match.name,
                                key: wsmatch.key,
                                status: MatchStatus.registry,
                                owner_user_key: wsmatch.owner_user_key,
                                players: wsmatch.players
                            });

                            res.redirect('/');

                        } else {

                            res.redirect('/?fail_msg=no possible to unregister for match');

                        }

                    }

                } else {

                    res.redirect('/?fail_msg=invalid owner_user_key');

                }

            } else {
                res.redirect('/?fail_msg=no provided ws_match_key or owner_user_key');
            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    public abort(req: Request, res: Response) {

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const ws_match_key: string = req.query.ws_match_key as string;

            if (ws_match_key !== undefined) {

                if (req.app.get("app_launched_matches").has(user.email)) {

                    const wsmatch = req.app.get("app_launched_matches").get(user.email).get(ws_match_key) as WS_Match;

                    if (wsmatch !== undefined) {

                        const match: Match = req.app.get("app_user_data_map")[user.email].matches[wsmatch.match.key];

                        // console.log("AQUI...0:" + wsmatch.match.key);
                        // console.log(req.app.get("app_user_data_map")[user.email].matches[wsmatch.match.key]);

                        if (match !== undefined) {

                            // console.log("AQUI...0");

                            wsmatch.abort();

                            const wsmatchinfo: WS_MatchInfo = req.app.get("app_ws_match_info_client") as WS_MatchInfo;

                            wsmatchinfo.setInfo({
                                name: wsmatch.match.name,
                                key: ws_match_key,
                                status: MatchStatus.aborted,
                                owner_user_key: wsmatch.owner_user_key,
                                players: wsmatch.players
                            });

                            req.app.get("app_launched_matches").get(user.email).delete(ws_match_key);

                            res.redirect('/');

                        }

                    } else {

                        res.redirect('/?fail_msg=invalid ws_match_key');

                    }


                } else {

                    res.redirect('/?fail_msg=invalid owner_user_key');

                }

            } else {

                res.redirect('/?fail_msg=no provided ws_match_key');

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
            // const user_key: string = req.query.user_key as string;

            if (match_key !== undefined) {

                const wsmatchinfo: WS_MatchInfo = req.app.get("app_ws_match_info_client") as WS_MatchInfo;

                const match: Match = req.app.get("app_user_data_map")[user.email].matches[match_key];

                const wsmatchkey = UID.get();

                const wsmatch: WS_Match = new WS_Match(wsmatchkey, user.email, match, (ev: string, wsmatch: WS_Match) => {

                    switch (ev) {

                        case MatchStatus.aborted:
                        case MatchStatus.finished:
                        case MatchStatus.started:
                        case MatchStatus.wait_to_start:
                        case MatchStatus.wait_to_registry:

                            wsmatchinfo.setInfo({
                                name: wsmatch.match.name,
                                key: wsmatch.key,
                                status: ev,
                                owner_user_key: wsmatch.owner_user_key,
                                players: wsmatch.players
                            });

                            break;


                    }

                });

                if (!req.app.get("app_launched_matches").has(user.email)) {

                    req.app.get("app_launched_matches").set(user.email, new Map());

                }

                req.app.get("app_launched_matches").get(user.email).set(wsmatch.key, wsmatch);

                wsmatch.launch(req.app.get("app_web_server_address"), req.app.get("app_websockt_server_port"));



                res.redirect('/match_home');

            } else {

                res.redirect('/match_view?fail_msg=invalid match_key');

            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }




}

export const matchController = new MatchController();