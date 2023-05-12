import { Request, Response } from "express";
import { User } from "../user";
import { Data } from "../data";
import { Quiz } from "../quiz";
import { Question } from "../question";
import { UID } from "../uid";
import { Match } from "../match";
import { Round } from "../round";

class RoundController {

    public register_form(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const match_key: string | undefined = req.query.match_key as string;

            if (match_key !== undefined) {

                const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;

                if (match_key in user_matches) {

                    const user_quizzes: { [key: string]: Quiz } = req.app.get("app_user_data_map")[user.email].quizzes;

                    res.render('round_register_form', {
                        title: app_name,
                        wsa: wsaddress,
                        wsp: wsport,
                        user: user,
                        user_matches: user_matches,
                        user_quizzes: user_quizzes,
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

    public edit_form(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const match_key: string | undefined = req.query.match_key as string;
            const round_key: string | undefined = req.query.round_key as string;

            if (match_key !== undefined) {

                if (round_key !== undefined) {

                    const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;

                    if (match_key in user_matches) {

                        const edit_match: Match = user_matches[match_key];

                        if (round_key in edit_match.rounds) {

                            const user_quizzes: { [key: string]: Quiz } = req.app.get("app_user_data_map")[user.email].quizzes;

                            res.render('round_edit_form', {
                                title: app_name,
                                wsa: wsaddress,
                                wsp: wsport,
                                user: user,
                                user_matches: user_matches,
                                user_quizzes: user_quizzes,
                                match_key: match_key,
                                round_key: round_key,
                                fail_msg: undefined
                            });

                        } else {

                            res.redirect('/match_home?fail_msg=invalid round_key');

                        }

                    } else {

                        res.redirect('/match_home?fail_msg=invalid match_key');

                    }

                } else {

                    res.redirect('/match_home?fail_msg=round_key is required');

                }

            } else {

                res.redirect('/match_home?fail_msg=match_key is required');

            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }


    public register(req: Request, res: Response) {

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const match_key: string | undefined = req.query.match_key as string;

            if (match_key !== undefined) {

                const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;
                const user_quizzes: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].quizzes;

                if (match_key in user_matches) {

                    const quiz_key: string | undefined = req.query.quiz_key as string;
                    const question_key: string | undefined = req.query.question_key as string;

                    if (quiz_key in user_quizzes) {

                        const quiz: Quiz = req.app.get("app_user_data_map")[user.email].quizzes[quiz_key];

                        if (question_key in quiz.questions) {

                            const shooting_timeout: number = 1000 * parseInt(req.query.quantity1 as string);
                            const response_timeout: number = 1000 * parseInt(req.query.quantity2 as string);
                            const pass_timeout: number = 1000 * parseInt(req.query.quantity3 as string);
                            const score: number = parseInt(req.query.quantity4 as string);

                            if (shooting_timeout !== undefined
                                && response_timeout !== undefined
                                && pass_timeout !== undefined
                                && score !== undefined) {

                                const round: Round = {
                                    key: UID.get(),
                                    quiz_theme: quiz.theme,
                                    question: quiz.questions[question_key],
                                    shooting_timeout: shooting_timeout,
                                    response_timeout: response_timeout,
                                    pass_timeout: pass_timeout,
                                    score: score
                                }

                                user_matches[match_key].rounds[round.key] = round;

                                Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));

                                // res.redirect('/round_edit_form?match_key=' + match_key + '&round_key=' + round.key);

                                res.redirect('/round_register_form?match_key=' + match_key);

                            } else {

                                res.redirect('/match_home?fail_msg=missing necessary data');

                            }

                        } else {

                            res.redirect('/match_home?fail_msg=invalid question_key');

                        }


                    } else {

                        res.redirect('/match_home?fail_msg=invalid quiz_key');

                    }


                } else {

                    res.redirect('/match_home?fail_msg=invalid match_key');

                }

            } else {

                res.redirect('/match_home?match_msg=quiz_key is required');

            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    public edit(req: Request, res: Response) {

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const match_key: string | undefined = req.query.match_key as string;

            if (match_key !== undefined) {

                const round_key: string | undefined = req.query.round_key as string;

                if (round_key !== undefined) {

                    const user_matches: { [key: string]: Match } = req.app.get("app_user_data_map")[user.email].matches;

                    if (match_key in user_matches) {

                        if (round_key in user_matches[match_key].rounds) {

                            const shooting_timeout: number = 1000 * parseInt(req.query.quantity1 as string);
                            const response_timeout: number = 1000 * parseInt(req.query.quantity2 as string);
                            const pass_timeout: number = 1000 * parseInt(req.query.quantity3 as string);
                            const score: number = parseInt(req.query.quantity4 as string);



                            if (shooting_timeout !== undefined
                                && response_timeout !== undefined
                                && pass_timeout !== undefined
                                && score !== undefined) {

                                let quiz_theme = user_matches[match_key].rounds[round_key].quiz_theme;
                                let question = user_matches[match_key].rounds[round_key].question;

                                const quiz_key = req.query.quiz_key as string;
                                const question_key = req.query.question_key as string;

                                if (quiz_key !== undefined && question_key !== undefined) {

                                    const user_quizzes: { [key: string]: Quiz } = req.app.get("app_user_data_map")[user.email].quizzes;

                                    if (quiz_key in user_quizzes) {

                                        if (question_key in user_quizzes[quiz_key].questions) {

                                            quiz_theme = user_quizzes[quiz_key].theme;
                                            question = user_quizzes[quiz_key].questions[question_key];

                                        } else {

                                            res.redirect('/match_home?fail_msg=invalid question_key');
                                            return;

                                        }

                                    } else {

                                        res.redirect('/match_home?fail_msg=invalid quiz_key');
                                        return;

                                    }

                                }

                                user_matches[match_key].rounds[round_key].shooting_timeout = shooting_timeout;
                                user_matches[match_key].rounds[round_key].response_timeout = response_timeout;
                                user_matches[match_key].rounds[round_key].pass_timeout = pass_timeout;
                                user_matches[match_key].rounds[round_key].score = score;
                                user_matches[match_key].rounds[round_key].quiz_theme = quiz_theme;
                                user_matches[match_key].rounds[round_key].question = question;

                                Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));

                                res.redirect('/round_edit_form?match_key=' + match_key + "&round_key=" + round_key);

                            } else {

                                res.redirect('/match_home?fail_msg=missing necessary data');

                            }

                        } else {

                            res.redirect('/match_home?fail_msg=invalid round_key');

                        }

                    } else {

                        res.redirect('/match_home?fail_msg=invalid match_key');

                    }

                } else {

                    res.redirect('/match_home?fail_msg=round_key is required');

                }


            } else {

                res.redirect('/match_home?fail_msg=match_key is required');

            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

}

export const roundController = new RoundController();