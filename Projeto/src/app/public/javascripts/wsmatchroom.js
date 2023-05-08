function wsmatchroom() {



    // Pegando as referências para os elementos da página.
    var wssp = document.getElementById('web_socket_server_port').innerHTML;
    var wsa = document.getElementById('web_server_address').innerHTML;
    var ws_match_owner_user_key = document.getElementById('ws_match_owner_user_key').innerHTML;
    var ws_match_player_key = document.getElementById('ws_match_player_key').innerHTML;
    var ws_match_player_name = document.getElementById('ws_match_player_name').innerHTML;
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
    var avatares_pass = document.getElementById('avatares_pass');
    var cronnos_status = document.getElementById('cronnos_status');
    var avatares_emojis = document.getElementById('avatares_emojis');
    var round_h = document.getElementById('round_h');

    var podium_div = document.getElementById('podium_div');
    var places_div = document.getElementById('places_div');
    var status_div = document.getElementById('status_div');

    var round_index = -1;
    var round_response = undefined;
    var player_pass = undefined;
    var player_response = undefined;

    // var alert1 = document.getElementById('alert1_audio');
    // var applause = document.getElementById('applause_audio');
    // var wrong = document.getElementById('wrong_audio');
    // var right = document.getElementById('right_audio');

    var register = new Audio("/audio/register.wav");
    var alert1 = new Audio("/audio/alert1.wav");
    var alert2 = new Audio("/audio/alert2.wav");
    var alert3 = new Audio("/audio/alert3.wav");
    var applause = new Audio("/audio/applause.wav");
    var wrong = new Audio("/audio/wrong.wav");
    var right = new Audio("/audio/right.wav");

    var socket = undefined;

    register.addEventListener("loadeddata", () => {

        if (register.readyState >= 2) {

            pass_button.addEventListener("click", (event) => {

                if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

                    socket.send(JSON.stringify({
                        sender: ws_match_player_key,
                        sender_cluster: ws_match_cluster_key,
                        receiver: ws_match_cluster_key,
                        receiver_cluster: ws_match_cluster_key,
                        msg_type: "29", // Protocol.match_shot_pass
                        msg_content: {
                            round_index: round_index,
                            player_pass: player_pass
                        }
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
                        msg_type: "28", // Protocol.match_shot_response
                        msg_content: {
                            round_index: round_index,
                            player_pass: player_pass
                        }
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

            var player_response_avatar = function (msg_obj) {

                var scoreboard = msg_obj.msg_content.scoreboard;
                var player_response = msg_obj.msg_content.player_response;

                if (player_response in scoreboard) {

                    return scoreboard[player_response].avatar;

                }

                return 128078;

            }

            var player_pass_avatar = function (msg_obj) {

                var scoreboard = msg_obj.msg_content.scoreboard;
                var player_pass = msg_obj.msg_content.player_pass;

                if (player_pass in scoreboard) {

                    return scoreboard[player_pass].avatar;

                }

                return 128078;

            }

            var is_player_response = function (msg_obj) {

                return ws_match_player_key === msg_obj.msg_content.player_response;

            }

            var is_player_pass = function (msg_obj) {

                return ws_match_player_key === msg_obj.msg_content.player_pass;

            }

            var question_options_update = function (msg_obj) {

                var ws_question_options = msg_obj.msg_content.question_options;
                var show_question_options = msg_obj.msg_content.match_show_question_options;
                var round_index = msg_obj.msg_content.round_index;
                var player_pass = msg_obj.msg_content.player_pass;

                while (question_options_list.lastElementChild) {

                    question_options_list.removeChild(question_options_list.lastElementChild);

                }

                if (ws_question_options !== undefined) {

                    if (is_player_response(msg_obj)) {

                        ws_question_options.forEach((option, index, array) => {





                            var li = document.createElement("LI");

                            var simbol = document.createElement("SCAN");
                            simbol.addEventListener("click", (ev) => {
                                // alert('&#x2705;');

                                if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

                                    socket.send(JSON.stringify({
                                        sender: ws_match_player_key,
                                        sender_cluster: ws_match_cluster_key,
                                        receiver: ws_match_cluster_key,
                                        receiver_cluster: ws_match_cluster_key,
                                        msg_type: "38", // Protocol.match_response
                                        msg_content: {
                                            round_response: option,
                                            round_index: round_index,
                                            player_pass: player_pass
                                        }
                                    }));

                                }


                            });
                            simbol.innerHTML = '&#x2705;';
                            simbol.style.cursor = "grab";
                            li.appendChild(simbol);



                            var op = document.createElement("SCAN");
                            op.innerHTML = option;
                            li.appendChild(op);

                            question_options_list.appendChild(li);

                        });


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
                var ws_quiz_theme = msg_obj.msg_content.quiz_theme;

                var round_score = msg_obj.msg_content.round_score;

                if (question_description !== undefined) {

                    question_description.innerHTML = "(" + round_score + " score) Question: " + ws_question_description;

                    if (ws_quiz_theme !== undefined) {

                        quiz_theme.innerHTML = "Theme: " + ws_quiz_theme;

                    }

                } else {

                    question_description.innerHTML = "no question";
                    quiz_theme.innerHTML = "no question";

                }

                question_options_update(msg_obj);

            }

            var round_update = function (msg_obj) {
                round_index = msg_obj.msg_content.round_index;
                player_pass = msg_obj.msg_content.player_pass;
                player_response = msg_obj.msg_content.player_response;
                round_response = msg_obj.msg_content.round_response;
                round_h.innerHTML = "Round: " + round_index;
                question_update(msg_obj);
            };

            var places_update = function (msg_obj) {

                var scoreboard = msg_obj.msg_content.scoreboard;

                while (places_div.lastElementChild) {

                    places_div.removeChild(places_div.lastElementChild);

                }

                var len = Math.min(3, Object.entries(scoreboard).length);

                var i = 0;

                for (var player_key in scoreboard) {

                    if (i < len) {

                        var div = document.createElement("DIV");

                        var h1 = document.createElement("H1");
                        h1.setAttribute("style", "font-size:50px;margin: 0px;padding: 0;");
                        h1.innerHTML = "&#" + scoreboard[player_key].avatar + ";";

                        var p1 = document.createElement("P");
                        p1.setAttribute("style", "margin: 0px;padding: 0;");
                        p1.innerHTML = scoreboard[player_key].name;

                        var h3 = document.createElement("h3");
                        h3.setAttribute("style", "margin: 0px;padding: 0;");
                        h3.innerHTML = "&#" + (129351 + i) + ";";

                        var h5 = document.createElement("h3");
                        h5.setAttribute("style", "margin: 0px;padding: 0;");
                        h5.innerHTML = scoreboard[player_key].score + " scores";

                        div.appendChild(h3);
                        div.appendChild(h1);
                        div.appendChild(p1);
                        div.appendChild(h5);

                        places_div.appendChild(div);

                    } else {

                        break;

                    }

                    i++;

                }

            }

            var scoreboard_update = function (msg_obj) {

                var scoreboard = msg_obj.msg_content.scoreboard;

                while (scoreboard_list.lastElementChild) {

                    scoreboard_list.removeChild(scoreboard_list.lastElementChild);

                }

                for (var player_key in scoreboard) {

                    var li = document.createElement("LI");
                    var div0 = document.createElement("DIV");
                    div0.setAttribute("class", "flex-container");
                    var div1 = document.createElement("DIV");
                    var p1 = document.createElement("P");
                    p1.setAttribute("style", "margin: 0px;padding: 0;");
                    p1.innerHTML = "&#" + msg_obj.msg_content.scoreboard[player_key].avatar + "; " + msg_obj.msg_content.scoreboard[player_key].name;
                    var p2 = document.createElement("P");
                    p2.setAttribute("style", "font-size:50%;margin: 0px;padding: 0;");
                    p2.innerHTML = player_key;
                    var p3 = document.createElement("P");
                    p3.setAttribute("style", "margin: 0px;padding: 7px 15px;");
                    p3.innerHTML = msg_obj.msg_content.scoreboard[player_key].score;
                    div1.setAttribute("style", "text-align: center;");
                    div1.appendChild(p1);
                    div1.appendChild(p2);
                    var div2 = document.createElement("DIV");
                    div2.setAttribute("style", "dtext-align: right;");
                    div2.appendChild(p3);
                    div0.appendChild(div1);
                    div0.appendChild(div2);
                    li.appendChild(div0);

                    scoreboard_list.appendChild(li);
                }

            };

            var avatares_update = function (msg_obj) {

                const avatares = msg_obj.msg_content.match_avatares;
                // console.log(JSON.stringify(avatares));

                while (avatares_emojis.lastElementChild) {

                    avatares_emojis.removeChild(avatares_emojis.lastElementChild);

                }

                avatares.forEach((value, index, array) => {

                    // const x = document.createElement("A");
                    // x.setAttribute("href", "/match_register_player?ws_match_key=" + ws_match_cluster_key + "&ws_match_owner_user_key=" + ws_match_owner_user_key + "&player_avatar=%26%23" + value);
                    // x.innerHTML = "&#" + value + ";";
                    // x.style.textDecorationLine = "none";

                    // avatares_emojis.appendChild(x)

                    const x = document.createElement("SPAN");
                    x.innerHTML = "&#" + value + ";";
                    x.style.cursor = "grab";
                    x.addEventListener("click", (ev) => {
                        // alert('&#x2705;');

                        if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

                            socket.send(JSON.stringify({
                                sender: ws_match_player_key,
                                sender_cluster: ws_match_cluster_key,
                                receiver: ws_match_cluster_key,
                                receiver_cluster: ws_match_cluster_key,
                                msg_type: "4", // Protocol.player_registry_at_match
                                msg_content: {
                                    player_key: ws_match_player_key,
                                    player_name: ws_match_player_name,
                                    avatar: value
                                }
                            }));

                        }


                    });


                    avatares_emojis.appendChild(x)

                });

            };

            var avatares_pass_update = function (msg_obj) {

                var scoreboard = msg_obj.msg_content.scoreboard;
                var round_index = msg_obj.msg_content.round_index;

                while (avatares_pass.lastElementChild) {

                    avatares_pass.removeChild(avatares_pass.lastElementChild);

                }

                if (ws_match_player_key === player_pass) {

                    // console.log("Passou aqui")

                    avatares_pass.hidden = false;
                    pas_room_div.hidden = false;

                    for (const player_key in scoreboard) {

                        if (ws_match_player_key !== player_key) {

                            const x = document.createElement("SPAN");
                            x.innerHTML = "&#" + scoreboard[player_key].avatar + ";";
                            x.style.cursor = "grab";
                            x.addEventListener("click", (ev) => {
                                // alert('&#x2705;');

                                avatares_pass.hidden = true;

                                if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

                                    socket.send(JSON.stringify({
                                        sender: ws_match_player_key,
                                        sender_cluster: ws_match_cluster_key,
                                        receiver: ws_match_cluster_key,
                                        receiver_cluster: ws_match_cluster_key,
                                        msg_type: "39", // Protocol.match_pass
                                        msg_content: {
                                            round_index: round_index,
                                            player_response: player_key,
                                            player_pass: ws_match_player_key
                                        }
                                    }));

                                }


                            });


                            avatares_pass.appendChild(x)

                        }

                    }

                } else {

                    avatares_pass.hidden = true;
                    pas_room_div.hidden = true;

                }


            };


            const cron = {

                idInterval: undefined,
                interval: 1000,
                time: 0,

                run: function (time, callback) {

                    if (this.idInterval !== undefined) {
                        clearInterval(this.idInterval);
                    }

                    this.time = time;

                    if (this.time > 0) {

                        var self = this;
                        this.idInterval = setInterval(() => {

                            self.time -= self.interval;

                            if (self.time < 0) {

                                clearInterval(this.idInterval);
                                self.time = 0;
                                this.idInterval = undefined;

                            }

                            callback(this.time);

                        }, this.interval);

                    }

                },

                stop: function () {

                    if (this.idInterval !== undefined) {
                        clearInterval(this.idInterval);
                        this.idInterval = undefined;
                    }

                }

            };

            var cronnos_update = function (msg_obj) {

                let ws_wait_time = msg_obj.msg_content.ws_wait_time;

                cron.run(ws_wait_time, (time) => {
                    if(time === 0){
                        cronnos_status.innerHTML = "&nbsp;";
                    }else{
                        cronnos_status.innerHTML = "Time left: " + Math.floor(time / 1000);
                    }
                    
                });

            }

            var resume_round_update = function (msg_obj) {

                var round_response_state = msg_obj.msg_content.round_response_state;

                switch (round_response_state) {

                    case 0: //Round_Response_State.timeout_shooting:

                        status_emoji.innerHTML = "&#10060;";
                        status_text.innerHTML = "&#8987; timed out for shooting";
                        alert2.play();

                        break;

                    case 1: // Round_Response_State.timeout_response:


                        status_emoji.innerHTML = "&#" + player_response_avatar(msg_obj) + ";";
                        status_text.innerHTML = "&#8987; timed out for reply";
                        alert2.play();

                        break;

                    case 2: // Round_Response_State.timeout_pass:

                        status_emoji.innerHTML = "&#" + player_pass_avatar(msg_obj) + ";";
                        status_text.innerHTML = "&#8987; timed out for pass";
                        alert2.play();

                        break;

                    case 3: //Round_Response_State.timeout_pass_response:

                        status_emoji.innerHTML = "&#" + player_response_avatar(msg_obj) + ";";
                        status_text.innerHTML = "&#8987; timed out for pass reply";
                        alert2.play();

                        break;
                    case 4: //Round_Response_State.right_response:

                        status_emoji.innerHTML = "&#" + player_response_avatar(msg_obj) + ";";
                        status_text.innerHTML = "&#128079; right answer";
                        right.play();

                        break;

                    case 5: //Round_Response_State.wrong_response:

                        status_emoji.innerHTML = "&#" + player_response_avatar(msg_obj) + ";";
                        status_text.innerHTML = "&#128078; wrong answer";
                        wrong.play();

                        break;
                    case 6: //Round_Response_State.right_pass_response:

                        status_emoji.innerHTML = "&#" + player_response_avatar(msg_obj) + ";";
                        status_text.innerHTML = "&#128079; right answer (pass reply)";
                        right.play();

                        break;

                    case 7: //Round_Response_State.wrong_pass_response:

                        status_emoji.innerHTML = "&#" + player_response_avatar(msg_obj) + ";";
                        status_text.innerHTML = "&#128078; wrong answer";
                        wrong.play();

                        break;

                }

            }

            var state = function (msg_obj) {

                cronnos_update(msg_obj);
                scoreboard_update(msg_obj);
                round_update(msg_obj);

                var ws_match_state = msg_obj.msg_content.ws_match_state;

                switch (ws_match_state) {
                    case 1: //wait_to_registry_match
                        register.play();
                    case 2: //player_registed_match
                    case 3: //player_unregisted_match
                        status_emoji.innerHTML = "&#x1F64B;";
                        status_text.innerHTML = "Open game for registration";
                        question_room_div.hidden = true;
                        register_room_div.hidden = false;
                        pas_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        status_div.hidden = true;
                        avatares_update(msg_obj);
                        break;

                    case 4: //wait_to_start_match
                        status_emoji.innerHTML = "&#x23F3;";
                        status_text.innerHTML = "Waiting for the start of the game";
                        question_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        status_div.hidden = false;
                        break;

                    case 5: //start_match
                        status_emoji.innerHTML = "&#x1F4E2;";
                        status_text.innerHTML = "start_match";
                        question_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        status_div.hidden = true;
                        break;

                    case 6: //wait_to_start_next_round: 
                        status_emoji.innerHTML = "&#x1F4E2;";
                        status_text.innerHTML = "wait_to_start_next_round";
                        question_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        status_div.hidden = true;
                        break;

                    case 7: //started_next_round: 
                        if(Object.entries(msg_obj.msg_content.scoreboard).length > 1)alert1.play();
                        status_emoji.innerHTML = "&#x1F4E2;";
                        status_text.innerHTML = "Round started";
                        question_room_div.hidden = false;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        status_div.hidden = true;
                        break;

                    case 8: //wait_to_shooting_round: 
                        status_emoji.innerHTML = "&#x1F579;";
                        status_text.innerHTML = "Choose answer or pass";
                        pass_button.disabled = false;
                        response_button.disabled = false;
                        question_room_div.hidden = false;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        pass_response_room_div.hidden = false;
                        status_div.hidden = true;
                        break;

                    case 9: //wait_to_pass_round: 
                        status_emoji.innerHTML = "&#" + player_pass_avatar(msg_obj) + ";";
                        status_text.innerHTML = "Passing the question to";
                        question_room_div.hidden = false;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = false;
                        status_div.hidden = true;
                        avatares_pass_update(msg_obj);
                        break;

                    case 10: //wait_to_response_round: 
                        status_emoji.innerHTML = "&#" + player_response_avatar(msg_obj) + ";";
                        status_text.innerHTML = "Answering the question";
                        question_room_div.hidden = false;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        status_div.hidden = true;

                        if(is_player_response(msg_obj)) alert3.play();
                        break;

                    case 11: //player_point_pass_round: 
                        status_emoji.innerHTML = "&#x1F4A3;";
                        status_text.innerHTML = "Passing the question";
                        question_room_div.hidden = false;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        status_div.hidden = true;
                        break;

                    case 12: //reponse_round: 
                        status_emoji.innerHTML = "&#x1F4A3;";
                        status_text.innerHTML = "Passing the question";
                        question_room_div.hidden = false;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        status_div.hidden = false;
                        break;

                    case 13: //wait_to_resume_round: 

                        resume_round_update(msg_obj);
                        question_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        status_div.hidden = false;
                        break;

                    case 14: //resume_round: 
                        // status_emoji.innerHTML = "&#x1F4A3;";
                        // status_text.innerHTML = "resume_round";
                        question_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        break;

                    case 15: //wait_to_end_match: 
                        status_emoji.innerHTML = "&#x1F6A7;";
                        status_text.innerHTML = "wait_to_end_match";
                        question_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        podium_div.hidden = false;
                        status_div.hidden = true;
                        places_update(msg_obj);
                        applause.play();
                        // places_update(msg_obj);
                        break;

                    case 16: //ended_match: 
                        status_emoji.innerHTML = "&#x1F6A7;";
                        status_text.innerHTML = "ended_match";
                        question_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        podium_div.hidden = false;
                        pas_room_div.hidden = true;
                        
                        break;

                    case 17: //wait_to_abort_match: 
                        status_emoji.innerHTML = "&#x1F4A3;";
                        status_text.innerHTML = "Waiting to destroy the match";
                        question_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        podium_div.hidden = true;
                        pas_room_div.hidden = true;
                        status_div.hidden = false;
                        break;

                    case 18: //aborted_match: 
                        status_emoji.innerHTML = "&#x1F4A3;";
                        status_text.innerHTML = "aborted_match";
                        question_room_div.hidden = true;
                        pass_response_room_div.hidden = true;
                        register_room_div.hidden = true;
                        pas_room_div.hidden = true;
                        podium_div.hidden = true;
                        status_div.hidden = false;
                        window.location.href = "/";
                        break;

                }



            };


        }
    });

};