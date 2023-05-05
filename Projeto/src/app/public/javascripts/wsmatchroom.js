function wsmatchroom() {



    // Pegando as referências para os elementos da página.
    var wssp = document.getElementById('web_socket_server_port').innerHTML;
    var wsa = document.getElementById('web_server_address').innerHTML;
    var ws_match_owner_user_key = document.getElementById('ws_match_owner_user_key').innerHTML;
    var ws_match_player_key = document.getElementById('ws_match_player_key').innerHTML;
    var ws_match_cluster_key = document.getElementById('ws_match_cluster_key').innerHTML;
    var user_key = document.getElementById('user_key').innerHTML;
    var pass_button = document.getElementById('pass_button');
    var response_button = document.getElementById('response_button');

    var status_emoji = document.getElementById('ws_match_status_emoji');
    var status_text = document.getElementById('ws_match_status_text');

    var question_room_div = document.getElementById('question_room_div');
    var question_description = document.getElementById('question_description');
    var question_options_list = document.getElementById('question_options_list');
    var quiz_theme = document.getElementById('quiz_theme');

    var register_room_div = document.getElementById('register_room_div');
    var pass_response_room_div = document.getElementById('pass_response_room_div');
    var scoreboard_list = document.getElementById('scoreboard_list');

    var pas_room_div = document.getElementById('pass_room_div');
    var pass_list = document.getElementById('pass_list');
    var cronnos_status = document.getElementById('cronnos_status');
    var avatares_emojis = document.getElementById('avatares_emojis');
    var round_h = document.getElementById('round_h');

    var socket = undefined;

    pass_button.addEventListener("click", (event) => {

        if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

            socket.send(JSON.stringify({
                sender: ws_match_player_key,
                sender_cluster: ws_match_cluster_key,
                receiver: ws_match_cluster_key,
                receiver_cluster: ws_match_cluster_key,
                msg_type: "25", // Protocol.player_shot_pass
                msg_content: {}
            }));

            pass_button.disabled = true;
            response_button.disabled = true;

        }

    });

    response_button.addEventListener("click", (event) => {

        if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

            socket.send(JSON.stringify({
                sender: ws_match_player_key,
                sender_cluster: ws_match_cluster_key,
                receiver: ws_match_cluster_key,
                receiver_cluster: ws_match_cluster_key,
                msg_type: "24", // Protocol.player_shot_response
                msg_content: {}
            }));

            pass_button.disabled = true;
            response_button.disabled = true;

        }

    });

    window.addEventListener("unload", (event) => {

        if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

            socket.close(1000);

        }

    });

    // Criando uma nova WebSocket.
    socket = new WebSocket('ws://' + wsa + ':' + wssp + '/');

    socket.onerror = function (error) {

        console.log('WebSocket error: ' + error);
        alert('WebSocket error: ' + error);
    };

    socket.onopen = function (event) {

        // alert("connected");

        socket.onmessage = function (event) {

            var msg_obj = JSON.parse(event.data);
            control(msg_obj);

        };

        socket.onclose = function (event) {
            console.log('Websocket Closed');
        };

        socket.send(JSON.stringify({
            sender: ws_match_player_key,
            sender_cluster: ws_match_cluster_key,
            receiver: ws_match_cluster_key,
            receiver_cluster: ws_match_cluster_key,
            msg_type: "37", // Protocol.match_info
            msg_content: {}
        }));

    };

    var control = function (msg_obj) {

        switch (msg_obj.msg_type) {

            case "37": // Protocol.match_state

                state(msg_obj);

                break;

        }

    };

    var is_player_response = function (msg_obj){

        return ws_match_player_key === msg_obj.msg_content.player_response;

    }

    var is_player_pass = function (msg_obj){

        return ws_match_player_key === msg_obj.msg_content.player_pass;

    }

    var question_options_update = function (msg_obj) {

        var ws_question_options = msg_obj.msg_content.question_options;
        var roundIndex = msg_obj.msg_content.roundIndex;
        var player_pass = msg_obj.msg_content.player_pass;

        while (question_options_list.lastElementChild) {

            question_options_list.removeChild(question_options_list.lastElementChild);

        }

        if(ws_question_options !== undefined){

            if(is_player_response(msg_obj)){                

                for (var option in ws_question_options) {

                    var li = document.createElement("LI");
                    var simbol = document.createElement("SCAN");
                    simbol.addEventListener("click",(ev)=>{
                        // alert('&#x2705;');

                        if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

                            socket.send(JSON.stringify({
                                sender: ws_match_player_key,
                                sender_cluster: ws_match_cluster_key,
                                receiver: ws_match_cluster_key,
                                receiver_cluster: ws_match_cluster_key,
                                msg_type: "38", // Protocol.match_response
                                msg_content: {
                                    roundResponse: ws_question_options[option],
                                    roundIndex: roundIndex,
                                    player_pass: player_pass
                                }
                            }));

                        }


                    });
                    var op = document.createElement("SCAN");
                    simbol.innerHTML = '&#x2705;';
                    op.innerHTML = ws_question_options[option];
                    li.appendChild(simbol);
                    li.appendChild(op);
                    question_options_list.appendChild(li);                    

                }

                

            } else {
    
                for (var option in ws_question_options) {

                    var li = document.createElement("LI");
                    var op = document.createElement("SCAN");
                    op.innerHTML = ws_question_options[option];
                    li.appendChild(op);
                    question_options_list.appendChild(li);                    

                }
    
            }

        }       

    }

    var question_update = function (msg_obj) {

        var ws_question_description = msg_obj.msg_content.question_description;
        var ws_question_options = msg_obj.msg_content.question_options;
        var ws_quiz_theme = msg_obj.msg_content.quiz_theme;

        if (question_description !== undefined) {

            question_description.innerHTML = "Question: " + ws_question_description;

            if (ws_quiz_theme !== undefined) {

                quiz_theme.innerHTML = "Theme: " + ws_quiz_theme;

                while (question_options_list.lastElementChild) {

                    question_options_list.removeChild(question_options_list.lastElementChild);

                }

                if (ws_question_options !== undefined) {

                    for (var option in ws_question_options) {

                        var li = document.createElement("LI");
                        var simbol = document.createElement("SCAN");
                        simbol.addEventListener("click",(ev)=>{
                            // alert('&#x2705;');

                        });
                        var op = document.createElement("SCAN");
                        document.createElement("LI");
                        simbol.innerHTML = '&#x2705;';
                        op.innerHTML = ws_question_options[option];

                        li.appendChild(simbol);
                        li.appendChild(op);
                        question_options_list.appendChild(li);

                    }

                }

            }

        } else {

            question_description.innerHTML = "no question";
            quiz_theme.innerHTML = "no question";

            while (question_options_list.lastElementChild) {

                question_options_list.removeChild(question_options_list.lastElementChild);

            }

        }



    }

    var round_update = function (msg_obj) {

        round_h.innerHTML = "Round: " + msg_obj.msg_content.roundIndex;
        question_update(msg_obj);

    };

    var scoreboard_update = function (msg_obj) {

        while (scoreboard_list.lastElementChild) {

            scoreboard_list.removeChild(scoreboard_list.lastElementChild);

        }

        for (var player_key in msg_obj.msg_content.scoreboard) {

            var li = document.createElement("LI");
            var div0 = document.createElement("DIV");
            var div1 = document.createElement("DIV");
            var p1 = document.createElement("P");
            p1.setAttribute("style", "margin: 0px;padding: 0;");
            p1.innerHTML = msg_obj.msg_content.scoreboard[player_key].avatar + " " + msg_obj.msg_content.scoreboard[player_key].name;
            var p2 = document.createElement("P");
            p2.setAttribute("style", "font-size:50%;margin: 0px;padding: 0;");
            p2.innerHTML = player_key;
            var p3 = document.createElement("P");
            p3.setAttribute("style", "margin: 0px;padding: 7px 15px;");
            p3.innerHTML = msg_obj.msg_content.scoreboard[player_key].score;
            div1.setAttribute("style", "float: left;text-align: center;");
            div1.appendChild(p1);
            div1.appendChild(p2);
            var div2 = document.createElement("DIV");
            div2.setAttribute("style", "float: left;text-align: right;");
            div2.appendChild(p3);
            div0.appendChild(div1);
            div0.appendChild(div2);
            li.appendChild(div0);

            scoreboard_list.appendChild(li);
        }

    };



    var avatares_update = function () {

        const avatar_list = [
            128120, 128121, 128122, 128125, 128126, 128118, 128113,
            128102, 128103, 128063, 128048, 128045, 128511, 129302
        ];

        for (var av in avatar_list) {

            const x = document.createElement("A");
            x.setAttribute("href", "/match_register_player?ws_match_key=" + ws_match_cluster_key + "&ws_match_owner_user_key=" + ws_match_owner_user_key + "&player_avatar=%26%23" + avatar_list[av]);
            x.innerHTML = "&#" + avatar_list[av] + ";";
            x.style.textDecorationLine = "none";
            avatares_emojis.appendChild(x)
        }

    };

    var cronnos_update = function (msg_obj) {

        var ws_wait_time = msg_obj.msg_content.ws_wait_time;

        // if(cronosIntervalId == undefined){
        //     clearInterval(cronosIntervalId);
        // }

        const cronosIntervalId = setInterval(() => {

            // console.log(ws_wait_time);

            ws_wait_time -= 1000;

            if (ws_wait_time < 0) {

                clearInterval(cronosIntervalId);
                // cronosIntervalId = undefined;
                cronnos_status.innerHTML = 0;

            } else {

                cronnos_status.innerHTML = Math.floor(ws_wait_time / 1000);

            }

        }, 1000);

    }

    var state = function (msg_obj) {

        cronnos_update(msg_obj);
        scoreboard_update(msg_obj);
        round_update(msg_obj);

        var ws_match_state = msg_obj.msg_content.ws_match_state;

        switch (ws_match_state) {
            case 1: //wait_to_registry_match
            case 2: //player_registed_match
            case 3: //player_unregisted_match
                status_emoji.innerHTML = "&#x1F64B;";
                status_text.innerHTML = "Open game for registration";
                question_room_div.hidden = true;
                register_room_div.hidden = false;
                pas_room_div.hidden = true;
                avatares_update();
                break;

            case 4: //wait_to_start_match
                status_emoji.innerHTML = "&#x23F3;";
                status_text.innerHTML = "Waiting for the start of the game";
                question_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 5: //wait_to_start_match
            case 6: //wait_to_start_next_round: 
                status_emoji.innerHTML = "&#x1F4E2;";
                status_text.innerHTML = "Game started";
                question_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 7: //started_next_round: 
                status_emoji.innerHTML = "&#x1F4E2;";
                status_text.innerHTML = "Round started";
                question_room_div.hidden = false;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 8: //wait_to_shooting_round: 
                status_emoji.innerHTML = "&#x1F579;";
                status_text.innerHTML = "Choose answer or pass";
                pass_button.disabled = false;
                response_button.disabled = false;
                question_room_div.hidden = false;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 9: //wait_to_shooting_pass_round: 
                status_emoji.innerHTML = "&#x1F579;";
                status_text.innerHTML = "Pass the question to";
                question_room_div.hidden = false;
                pass_response_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = false;
                break;

            case 10: //wait_to_shooting_response_round: 
                status_emoji.innerHTML = "&#x1F4DD;";
                status_text.innerHTML = "Answering the question";
                question_room_div.hidden = false;
                pass_response_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 11: //player_point_pass_round: 
                status_emoji.innerHTML = "&#x1F4A3;";
                status_text.innerHTML = "Passing the question";
                question_room_div.hidden = false;
                pass_response_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 12: //reponse_round: 
                status_emoji.innerHTML = "&#x1F4A3;";
                status_text.innerHTML = "Passing the question";
                question_room_div.hidden = false;
                pass_response_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 13: //wait_to_resume_round: 
                status_emoji.innerHTML = "&#x1F4A3;";
                status_text.innerHTML = "wait_to_resume_round";
                question_room_div.hidden = true;
                pass_response_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 14: //resume_round: 
                status_emoji.innerHTML = "&#x1F4A3;";
                status_text.innerHTML = "resume_round";
                question_room_div.hidden = true;
                pass_response_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 15: //ended_match: 
                status_emoji.innerHTML = "&#x1F4A3;";
                status_text.innerHTML = "ended_match";
                question_room_div.hidden = true;
                pass_response_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 16: //wait_to_abort_match: 
                status_emoji.innerHTML = "&#x1F4A3;";
                status_text.innerHTML = "wait_to_abort_match";
                question_room_div.hidden = true;
                pass_response_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

            case 17: //aborted_match: 
                status_emoji.innerHTML = "&#x1F4A3;";
                status_text.innerHTML = "aborted_match";
                question_room_div.hidden = true;
                pass_response_room_div.hidden = true;
                register_room_div.hidden = true;
                pas_room_div.hidden = true;
                break;

        }



    };




};