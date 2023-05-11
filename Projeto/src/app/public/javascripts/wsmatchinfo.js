function wsmatchinfo() {

    // Pegando as referências para os elementos da página.
    var wssp = document.getElementById('web_socket_server_port').innerHTML;
    var wsa = document.getElementById('web_server_address').innerHTML;
    var wsmatchinfoclusterkey = document.getElementById('ws_matchinfo_cluster_key').innerHTML;
    var wsmatchinfokey = document.getElementById('ws_matchtinfo_key').innerHTML;
    var user_key = document.getElementById('user_key').innerHTML;
    var launched_matches_list = document.getElementById('launched_matches_list');


    var socket = undefined;

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
            var launched_matches = msg_obj.msg_content;

            while (launched_matches_list.lastElementChild) {

                launched_matches_list.removeChild(launched_matches_list.lastElementChild);

            }

            for (const wsmatchkey in launched_matches) {

                var matchname = launched_matches[wsmatchkey].name;
                var matchstatus = launched_matches[wsmatchkey].status;
                var owner_user_key = launched_matches[wsmatchkey].owner_user_key;

                var status_simbol = '&#x270D;';
                var tooltip_text = 'Entrar';
                var match_name = " " + matchname;

                switch (matchstatus) {
                    case "1":
                        status_simbol = '&#x23F3;';
                        tooltip_text = 'Esperando início';
                        break;
                    case "2":
                        status_simbol = '&#x1F4E2;';
                        tooltip_text = 'Jogando';
                        break;
                    case "3":
                        status_simbol = '&#x1F4A3;';
                        tooltip_text = 'Finalizado';
                        break;
                }

                const x = document.createElement("A");

                x.setAttribute("class", "tooltip");
                x.style.textDecorationLine = "none";
                x.innerHTML = status_simbol;
                const s = document.createElement("SPAN");
                s.setAttribute("class", "tooltiptext");
                s.innerHTML = tooltip_text;

                x.appendChild(s);

                var y = document.createElement("LI");
                const n = document.createElement("A");
                n.setAttribute("href", "/match_room?ws_match_key=" + wsmatchkey + "&ws_match_owner_user_key="+owner_user_key);
                n.style.textDecorationLine = "none";
                n.innerHTML = match_name;

                y.appendChild(x);
                y.appendChild(n);

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



                launched_matches_list.appendChild(y);

            }

            // alert(event.data);

        };

        socket.onclose = function (event) {
            console.log('Websocket Closed');
            // alert('Websocket Closed');
        };

        socket.send(JSON.stringify({
            sender: wsmatchinfokey,
            sender_cluster: wsmatchinfoclusterkey,
            receiver: wsmatchinfoclusterkey,
            receiver_cluster: wsmatchinfoclusterkey,
            msg_type: "36", // Protocol.match_info
            msg_content: {}
        }));


    };

};