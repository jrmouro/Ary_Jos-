import { Request, Response } from "express";
import { User } from "../user";
import { Data } from "../data";
import { Quiz } from "../quiz";

class QuizController {

    public home(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const user_quizzes: { [key: string]: Quiz } = req.app.get("app_user_data_map")[user.email].quizzes;

            res.render('quiz_home', {
                title: app_name,
                wsa: wsaddress,
                wsp: wsport,
                user: user,
                user_quizzes: user_quizzes,
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

            const quiz_key: string = req.query.quiz_key as string;

            if (quiz_key !== undefined) {

                const user_quizzes: { [key: string]: Quiz } = req.app.get("app_user_data_map")[user.email].quizzes;

                res.render('quiz_view', {
                    title: app_name,
                    wsa: wsaddress,
                    wsp: wsport,
                    user: user,
                    user_quizzes: user_quizzes,
                    quiz_key: quiz_key,
                    fail_msg: undefined
                });

            } else {

                res.redirect('/quiz_home?fail_msg=invalid quiz_key');

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

            const user_quizzes: { [key: string]: Quiz } = req.app.get("app_user_data_map")[user.email].quizzes;

            res.render('quiz_register_form', {
                title: app_name,
                wsa: wsaddress,
                wsp: wsport,
                user: user,
                user_quizzes: user_quizzes,
                fail_msg: undefined
            });

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

            const quiz_key: string = req.query.quiz_key as string;

            if (quiz_key !== undefined) {

                const user_quizzes: { [key: string]: Quiz } = req.app.get("app_user_data_map")[user.email].quizzes;

                if (quiz_key in user_quizzes) {

                    res.render('quiz_edit_form', {
                        title: app_name,
                        wsa: wsaddress,
                        wsp: wsport,
                        user: user,
                        user_quizzes: user_quizzes,
                        quiz_key: quiz_key,
                        fail_msg: undefined
                    });

                } else {

                    res.redirect('/quiz_home?fail_msg=invalid quiz_key');

                }

            } else {

                res.redirect('/quiz_home?fail_msg=quiz_key is required');

            }

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
            const theme: string = req.query.theme as string;

            const quiz: Quiz = new Quiz(name, theme);

            const user_quizzes: { [key: string]: Quiz } = req.app.get("app_user_data_map")[user.email].quizzes;
            user_quizzes[quiz.key] = quiz;

            Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));

            res.redirect('/quiz_edit_form?quiz_key='+ quiz.key);

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    public edit(req: Request, res: Response) {
        
        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const quiz_key: string = req.query.quiz_key as string;
            const name: string = req.query.name as string;
            const theme: string = req.query.theme as string;

            if( quiz_key in req.app.get("app_user_data_map")[user.email].quizzes){

                req.app.get("app_user_data_map")[user.email].quizzes[quiz_key].name = name;
                req.app.get("app_user_data_map")[user.email].quizzes[quiz_key].theme = theme;

            }

            Data.writeFileSync<User>(req.app.get("app_user_data_path"), req.app.get("app_user_data_map"));

            res.redirect('/quiz_edit_form?quiz_key='+ quiz_key);

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }

    public delete(req: Request, res: Response) {

        const wsaddress = req.app.get("app_web_server_address");
        const wsport = req.app.get("app_web_server_port");
        const app_name = req.app.get("app_name");

        const user: User = req.app.get("users_session_login").get(req.session.id);

        if (user !== undefined) {

            const quiz_key: string = req.query.quiz_key as string;

            if (quiz_key !== undefined) {

                const user_quizzes: { [key: string]: Quiz } = req.app.get("app_user_data_map")[user.email].quizzes;

                if (quiz_key in user_quizzes) {

                    delete user_quizzes[quiz_key];
                    res.redirect('/quiz_home');

                } else {

                    res.redirect('/quiz_home');

                }

            } else {

                res.redirect('/quiz_home');

            }

        } else {

            res.redirect('/user_login_form?fail_msg=login is required');

        }

    }



}

export const quizController = new QuizController();