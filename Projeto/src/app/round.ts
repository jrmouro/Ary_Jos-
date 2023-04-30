import { Question } from "./question";

export interface Round {

    key: string;
    quiz_theme: string;
    question: Question;
    shooting_timeout: number;
    response_timeout: number;
    pass_timeout: number;
    score: number;

}

// export class WS_Round implements Round, WS_MSG_CRTL{

//     key: string;
//     quiz_theme: string;
//     question: Question;
//     response_timeout: number;
//     score: Number;

//     match_timeoutId:NodeJS.Timeout | undefined = undefined;

//     constructor(key: string, quiz_theme: string, question: Question, response_timeout: number, score: Number){
//         this.key = key;
//         this.quiz_theme = quiz_theme;
//         this.question = question;
//         this.response_timeout = response_timeout;
//         this.score = score;
//     }

//     receive(ws_msg: WS_MSG, ws:WebSocket): void {

//         switch(ws_msg.msg_type){
//             case "close_round":
//             case "end_round":
//                 if(ws_msg.msg_content?.round_key === this.key)
//                     ws.close(1000);
//                 break;
//         }
        
//     }

//     start(socket:WebSocket, match_key:string){

//         var self = this;

//         this.match_timeoutId = setTimeout(function () {

//             socket.send(
//                 JSON.stringify({
//                     sender: match_key,
//                     sender_cluster: match_key,
//                     receiver: "__cluster__",
//                     receiver_cluster: match_key,
//                     msg_type: "end_round",
//                     msg_content: {
//                         round_key: self.key
//                     }
//                 }));

//         }, this.response_timeout);

//         socket.send(
//             JSON.stringify({
//                 sender: match_key,
//                 sender_cluster: match_key,
//                 receiver: "__cluster__",
//                 receiver_cluster: match_key,
//                 msg_type: "start_round",
//                 msg_content: {
//                     round_key: self.key,
//                     round_quiz_theme: self.quiz_theme,
//                     round_question: self.question,
//                     round_response_timeout: self.response_timeout,
//                     round_score: self.score
//                 }
//             }));
        
//     }

    

// }