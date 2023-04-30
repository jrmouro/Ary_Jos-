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

    var state = function (msg_obj) {

        status_update(msg_obj);

    };

    var status_update = function (msg_obj) {

        if (msg_obj.msg_content.state_flag.isOpenToRegistry) {

            status_emoji.innerHTML = "&#x1F64B;";
            status_text.innerHTML = "Open to Register";
            question_room_div.hidden = true;
            register_room_div.hidden = false;

        } else {

            if (msg_obj.msg_content.state_flag.isRunning) {

                if (user_key in msg_obj.msg_content.scoreboard) {

                    if (msg_obj.msg_content.state_flag.isRoundShooting) {

                        status_emoji.innerHTML = "&#x1F647;";
                        status_text.innerHTML = "players shooting";

                    } else {

                        if (msg_obj.msg_content.state_flag.isRoundResponse) {

                            status_emoji.innerHTML = "&#x1F646;";
                            status_text.innerHTML = msg_obj.msg_content.player_response + " responsing";

                        } else if (msg_obj.msg_content.state_flag.isRoundPass) {

                            status_emoji.innerHTML = "&#x1F481;";
                            status_text.innerHTML = msg_obj.msg_content.player_pass + " passing";

                        } else {

                            status_emoji.innerHTML = "&#x1F64E;";
                            status_text.innerHTML = "?";

                        }

                    }

                } else {

                    status_emoji.innerHTML = "&#x1F575;";
                    status_text.innerHTML = "watching the match";

                }

            } else {

                status_emoji.innerHTML = "&#x1F645;";
                status_text.innerHTML = "Finished Match";
                pass_response_room_div.hidden = true;
                question_room_div.hidden = true;
                register_room_div.hidden = true;

            }

        }

        while (scoreboard_list.lastElementChild) {

            scoreboard_list.removeChild(scoreboard_list.lastElementChild);

        }

        for (var player_key in msg_obj.msg_content.scoreboard) {

            var li = document.createElement("LI");
            var div0 = document.createElement("DIV");
            var div1 = document.createElement("DIV");
            var p1 = document.createElement("P");
            p1.setAttribute("style", "margin: 0px;padding: 0;");
            p1.innerHTML = msg_obj.msg_content.scoreboard[player_key].name;
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

};