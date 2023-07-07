import { Request, Response } from "express";
import { User } from "../user";
import { UID } from "../uid";
import { Data } from "../data";
import { WS_ChallengeInfo } from "../ws_challenge_info";
import { Challenge } from "../challenge";
import { WS_Challenge } from "../ws_challenge";
import { ChallengeStatus } from "../challenge_status";

class ChallengeController {

    public home(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const wss_port = req.app.get("app_websockt_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const fail_msg = req.query.fail_msg;

            const wschallengeinfo: WS_ChallengeInfo = req.app.get("app_ws_challenge_info_client") as WS_ChallengeInfo;

            const user_challenges: { [key: string]: Challenge } = req.app.get("app_user_data_map")[user.email].challenges;

            res.render('challenge_home', {
                title: app_name,
                wsa: wsaddress,
                wsp: wsport,
                wssp: wss_port,
                user: user,
                user_challenges: user_challenges,
                wschallengeinfoclusterkey: wschallengeinfo.key,
                wschallengeinfokey: UID.get(),
                fail_msg: fail_msg
            });

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }


    }

    public register(req: Request, res: Response) {
        
        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const name: string = req.query.name as string;

            
            const challenge: Challenge = {
                key: UID.get(),
                name: name,
                rounds: {}
            }

            const user_challenges: { [key: string]: Challenge } = req.app.get("app_user_data_map")[user.email].challenges;
            user_challenges[challenge.key] = challenge;

            Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));

            res.redirect('/challenge_edit_form?challenge_key='+ challenge.key);

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    public edit(req: Request, res: Response) {
        
        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const challenge_key: string = req.query.challenge_key as string;
            const name: string = req.query.name as string;

            if( challenge_key in req.app.get("app_user_data_map")[user.email].challenges){

                req.app.get("app_user_data_map")[user.email].challenges[challenge_key].name = name;
                
                Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));

                res.redirect('/challenge_edit_form?challenge_key='+ challenge_key);

            } else {

                res.redirect('/user_login_form?fail_msg=invalid challenge_key');

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

            const challenge_key: string = req.query.challenge_key as string;

            const fail_msg = req.query.fail_msg;

            if (challenge_key !== undefined) {

                const user_challenges: { [key: string]: Challenge } = req.app.get("app_user_data_map")[user.email].challenges;

                if (challenge_key in user_challenges) {

                    const edit_quiz: Challenge = user_challenges[challenge_key];

                    res.render('challenge_edit_form', {
                        title: app_name,
                        wsa: wsaddress,
                        wsp: wsport,
                        user: user,
                        user_challenges: user_challenges,
                        challenge_key: challenge_key,
                        fail_msg: fail_msg
                    });

                } else {

                    res.redirect('/challenge_home?fail_msg=invalid challenge_key');

                }

            } else {

                res.redirect('/challenge_home?fail_msg=challenge_key is required');

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

            const fail_msg = req.query.fail_msg;

            const user_challenges: { [key: string]: Challenge } = req.app.get("app_user_data_map")[user.email].challenges;

            res.render('challenge_register_form', {
                title: app_name,
                wsa: wsaddress,
                wsp: wsport,
                user: user,
                user_challenges: user_challenges,
                fail_msg: fail_msg
            });

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    // public room(req: Request, res: Response) {

    //     const wsaddress = req.app.get("app_web_server_address");
    //     const wsport = req.app.get("app_web_server_port");
    //     const wss_port = req.app.get("app_websockt_server_port");
    //     const app_name = req.app.get("app_name");

    //     const user: User = req.app.get("users_session_login").get(req.session.id);
    //     const fail_msg = req.query.fail_msg;

    //     if (user !== undefined) {

    //         const ws_match_key: string = req.query.ws_match_key as string; 
    //         const owner_user_key: string = req.query.ws_match_owner_user_key as string;

    //         if (ws_match_key !== undefined && owner_user_key !== undefined) {

    //             if (req.app.get("app_launched_matches").has(owner_user_key)) {

    //                 const wsmatch = req.app.get("app_launched_matches").get(owner_user_key).get(ws_match_key) as WS_Match;
                    
    //                 if (wsmatch !== undefined) {

    //                     res.render('match_room', {
    //                         title: app_name,
    //                         wsa: wsaddress,
    //                         wsp: wsport,
    //                         wssp: wss_port,
    //                         user: user,
    //                         match: wsmatch.match,
    //                         ws_match_cluster_key: wsmatch.key,
    //                         ws_match_owner_user_key: wsmatch.owner_user_key,
    //                         ws_match_player_key: user.email,
    //                         ws_match_player_name: user.name,
    //                         fail_msg: fail_msg
    //                     });

    //                 } else {

    //                     res.redirect('/?fail_msg=invalid ws_match_key');

    //                 }

    //             } else {

    //                 res.redirect('/?fail_msg=invalid owner_user_key');

    //             }



    //         } else {

    //             res.redirect('/?fail_msg=ws_match_key or owner_user_key not provided');

    //         }

    //     } else {

    //         res.redirect('/user_login_form?fail_msg=login is required');

    //     }


    // }

    public view(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const challenge_key: string = req.query.challenge_key as string;

            if (challenge_key !== undefined) {

                const fail_msg = req.query.fail_msg;

                const user_challenges: { [key: string]: Challenge } = req.app.get("app_user_data_map")[user.email].challenges;

                res.render('challenge_view', {
                    title: app_name,
                    wsa: wsaddress,
                    wsp: wsport,
                    user: user,
                    user_challenges: user_challenges,
                    challenge_key: challenge_key,
                    fail_msg: fail_msg
                });

            } else {

                res.redirect('/challenge_home?fail_msg=invalid challenge_key');

            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

  

    public abort(req: Request, res: Response) {

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const ws_challenge_key: string = req.query.ws_challenge_key as string;

            if (ws_challenge_key !== undefined) {

                if (req.app.get("app_launched_challenges").has(user.email)) {

                    const wschallenge = req.app.get("app_launched_challenges").get(user.email).get(ws_challenge_key) as WS_Challenge;

                    if (wschallenge !== undefined) {

                        const match: Challenge = req.app.get("app_user_data_map")[user.email].challenges[wschallenge.challenge.key];

                        // console.log("AQUI...0:" + wsmatch.match.key);
                        // console.log(req.app.get("app_user_data_map")[user.email].matches[wsmatch.match.key]);

                        if (match !== undefined) {

                            // console.log("AQUI...0");

                            wschallenge.abort();

                            const wschallengeinfo: WS_ChallengeInfo = req.app.get("app_ws_challenge_info_client") as WS_ChallengeInfo;

                            wschallengeinfo.setInfo({
                                name: wschallenge.challenge.name,
                                key: ws_challenge_key,
                                status: ChallengeStatus.aborted,
                                owner_user_key: wschallenge.owner_user_key,
                                players: wschallenge.players
                            });

                            req.app.get("app_launched_challenges").get(user.email).delete(ws_challenge_key);

                            res.redirect('/');

                        }

                    } else {

                        res.redirect('/?fail_msg=invalid ws_challenge_key');

                    }


                } else {

                    res.redirect('/?fail_msg=invalid owner_user_key');

                }

            } else {

                res.redirect('/?fail_msg=no provided ws_challenge_key');

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

            const challenge_key: string = req.query.challenge_key as string;

            // console.log("+++++++++:  ", challenge_key)

            if (challenge_key !== undefined) {

                const wschallengeinfo: WS_ChallengeInfo = req.app.get("app_ws_challenge_info_client") as WS_ChallengeInfo;

                const challenge: Challenge = req.app.get("app_user_data_map")[user.email].challenges[challenge_key];

                const wschallengekey = UID.get();

                const wschallenge: WS_Challenge = new WS_Challenge(wschallengekey, user.email, challenge, (ev: string, wschallenge: WS_Challenge) => {

                    switch (ev) {

                        case ChallengeStatus.launched:
                        // case ChallengeStatus.aborted:
                        // case ChallengeStatus.ended:
                        // case ChallengeStatus.started:
                        // case ChallengeStatus.wait_to_start:
                        // case ChallengeStatus.wait_to_registry:

                        // console.log("Chellenge Launched: " + challenge.name);

                            wschallengeinfo.setInfo({
                                name: wschallenge.challenge.name,
                                key: wschallenge.key,
                                status: ev,
                                owner_user_key: wschallenge.owner_user_key,
                                players: wschallenge.players
                            });

                            break;

                    }

                });

                if (!req.app.get("app_launched_challenges").has(user.email)) {

                    req.app.get("app_launched_challenges").set(user.email, new Map());

                }

                req.app.get("app_launched_challenges").get(user.email).set(wschallenge.key, wschallenge);

                wschallenge.launch(req.app.get("app_web_server_address"), req.app.get("app_websockt_server_port"));

                res.redirect('/challenge_home');

            } else {

                res.redirect('/challenge_view?fail_msg=invalid challenge_key');

            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }




}

export const challengeController = new ChallengeController();