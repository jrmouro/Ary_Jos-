import { Router } from "express";
import { homeController } from "./controller/HomeController";
import { userController } from "./controller/UserController";
import { quizController } from "./controller/QuizController";
import { questionController } from "./controller/QuestionController";
import { matchController } from "./controller/MatchController";

const router: Router = Router()

//Routes
router.get("/", homeController.home);
//user
router.get("/user_register", userController.register);
router.get("/user_register_form", userController.register_form);
router.get("/user_login", userController.login);
router.get("/user_login_form", userController.login_form);
router.get("/user_logout", userController.logout);

//Quizzes
router.get("/quiz_home", quizController.home);
router.get("/quiz_view", quizController.view);
router.get("/quiz_register", quizController.register);
router.get("/quiz_edit", quizController.edit);
router.get("/quiz_edit_form", quizController.edit_form);
router.get("/quiz_register_form", quizController.register_form);
router.get("/quiz_delete", quizController.delete);

//Questions
router.get("/question_register_form", questionController.register_form);
router.get("/question_edit_form", questionController.edit_form);
router.get("/question_register", questionController.register);
router.get("/question_edit", questionController.edit);

//Matches
router.get("/match_home", matchController.home);
router.get("/match_view", matchController.view);
router.get("/match_launch", matchController.launch);
router.get("/match_abort", matchController.abort);
router.get("/match_room", matchController.room);
router.get("/match_register", matchController.register);
router.get("/match_edit", matchController.edit);
router.get("/match_edit_form", matchController.edit_form);
router.get("/match_register_form", matchController.register_form);
router.get("/match_register_player", matchController.register_player);
router.get("/match_unregister_player", matchController.unregister_player);

// router.get("/player_register", registerController.player);
// router.get("/match_register", registerController.match);



export { router };