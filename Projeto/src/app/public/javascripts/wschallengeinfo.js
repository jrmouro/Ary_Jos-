function wschallengeinfo(filter=false) {

    var wssp = document.getElementById('web_socket_server_port').innerHTML;
    var wsa = document.getElementById('web_server_address').innerHTML;
    var wschallengeinfoclusterkey = document.getElementById('ws_challengeinfo_cluster_key').innerHTML;
    var wschallengeinfokey = document.getElementById('ws_challengeinfo_key').innerHTML;
    var user_key = document.getElementById('user_key').innerHTML;
    var launched_challenges_list = document.getElementById('launched_challenges_list');


    var socket = undefined;

    window.addEventListener("unload", (event) => {

        if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

            socket.close(1000);

        }

    });

    
    socket = new WebSocket('ws://' + wsa + ':' + wssp + '/');

    socket.onerror = function (error) {
        console.log('WebSocket error: ' + error);

        alert('WebSocket error: ' + error);
    };

    socket.onopen = function (event) {

        socket.onmessage = function (event) {

            // console.log(event.data);

            var msg_obj = JSON.parse(event.data);
            var launched_challenges = msg_obj.msg_content;

            while (launched_challenges_list.lastElementChild) {

                launched_challenges_list.removeChild(launched_challenges_list.lastElementChild);

            }

            for (const wschallengekey in launched_challenges) {

                var owner_user_key = launched_challenges[wschallengekey].owner_user_key;

                if((filter && owner_user_key === user_key)||!filter ){

                var challengename = launched_challenges[wschallengekey].name;
                var challengeaddress = launched_challenges[wschallengekey].ws_address;
                var challengestatus = launched_challenges[wschallengekey].status;

                var status_simbol = '&#x1F577;';
                var tooltip_text = 'game';

                switch (challengestatus) {
                    case "1":
                        status_simbol = '&#x23F3;';
                        tooltip_text = 'waiting start';
                        break;
                    case "2":
                        status_simbol = '&#x1F4E2;';
                        tooltip_text = 'starded';
                        break;
                    case "3":
                        status_simbol = '&#x1F4A3;';
                        tooltip_text = 'finished';
                        break;
                }

                const x = document.createElement("A");
                x.setAttribute("target", "_blank");

                const ws_client = Date.now().toString(36) + Math.random().toString(36).substr(2);

                x.setAttribute("href", "http://" + challengeaddress + "/?ws_cluster=" + wschallengekey + "&ws_client=" + ws_client + "&wssa=" + wsa + "&wssp=" + wssp);
                x.setAttribute("class", "tooltip");
                x.style.textDecorationLine = "none";
                x.innerHTML = status_simbol;
                const s = document.createElement("SPAN");
                s.setAttribute("class", "tooltiptext");
                s.innerHTML = tooltip_text;

                x.appendChild(s);

                var y = document.createElement("LI");
                var v = document.createTextNode(" " + challengename);
                y.appendChild(x);
                y.appendChild(v);

                if (owner_user_key == user_key) {

                    // const a = document.createElement("A");
                    // a.setAttribute("href", "/match_abort?ws_match_key=" + wsmatchkey + "&owner_user_key="+owner_user_key);
                    // a.setAttribute("class", "tooltip");
                    // a.style.textDecorationLine = "none";
                    // a.innerHTML = '&#x1F645;';
                    // const sa = document.createElement("SPAN");
                    // sa.setAttribute("class", "tooltiptext");
                    // sa.innerHTML = "abort";
                    // a.appendChild(sa);
                    // y.appendChild(a);

                } else {
                    // alert(owner_user_key + " - " + user_key);
                }



                launched_challenges_list.appendChild(y);

            }

            }

        };

        socket.onclose = function (event) {
            console.log('Websocket Closed');
        };

        socket.send(JSON.stringify({
            sender: wschallengeinfokey,
            sender_cluster: wschallengeinfoclusterkey,
            receiver: wschallengeinfoclusterkey,
            receiver_cluster: wschallengeinfoclusterkey,
            msg_type: "56", // Protocol.challenge_info
            msg_content: {}
        }));


    };

};