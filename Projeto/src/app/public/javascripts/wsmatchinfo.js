function wsmatchinfo() {

    // window.onload = function () {

    // Pegando as referências para os elementos da página.
    var wssp = document.getElementById('web_socket_server_port').innerHTML;
    var wsa = document.getElementById('web_server_address').innerHTML;
    var wsmatchinfoclusterkey = document.getElementById('ws_matchtinfo_cluster_key').innerHTML;
    var wsmatchinfokey = document.getElementById('ws_matchtinfo_key').innerHTML;
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

                var x = document.createElement("LI");
                var t = document.createTextNode(matchname);
                x.appendChild(t);
                launched_matches_list.appendChild(x);

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