function wsmatch() {

    // Pegando as referências para os elementos da página.
    var wssp = document.getElementById('web_socket_server_port').innerHTML;
    var wsa = document.getElementById('web_server_address').innerHTML;
    var ws_match_player_key = document.getElementById('ws_match_player_key').innerHTML;
    var ws_match_cluster_key = document.getElementById('ws_match_cluster_key').innerHTML;
    var user_key = document.getElementById('user_key').innerHTML;

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

        };

        socket.onclose = function (event) {
            console.log('Websocket Closed');
        };

        socket.send(JSON.stringify({
            sender: ws_match_player_key,
            sender_cluster: ws_match_cluster_key,
            receiver: ws_match_cluster_key,
            receiver_cluster: ws_match_cluster_key,
            msg_type: "36", // Protocol.match_info
            msg_content: {}
        }));

    };

};