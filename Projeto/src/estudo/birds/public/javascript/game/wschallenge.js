class WSChallenge {

    static get(
        challenge_service,
        rounds = (rounds) => {}, timeout = 30000) {

        try {
            // Do something that might trigger an error

            const socket = new WebSocket('ws://' + challenge_service.wssa + ':' + challenge_service.wssp + '/');

            socket.onerror = function (error) {
                alert('WSChallenge websocket error: ' + error);
            };

            socket.onopen = function (event) {

                let timeoutId = undefined;

                socket.onmessage = function (event) {

                    var msg_obj = JSON.parse(event.data.toString());

                    if (msg_obj.msg_type === '56') {

                        clearTimeout(timeoutId);

                        rounds(msg_obj.msg_content);

                        socket.close(1000)

                    }

                    console.log('WSChallenge websocket onmessage: ' + event.data.toString());

                };

                socket.onclose = function (event) {
                    console.log('WSChallenge websocket closed');
                };

                socket.send(JSON.stringify({
                    sender: challenge_service.ws_client,
                    sender_cluster: challenge_service.ws_cluster,
                    receiver: challenge_service.ws_cluster,
                    receiver_cluster: challenge_service.ws_cluster,
                    msg_type: "56", // Protocol.challenge_info
                    msg_content: {}
                }));

                timeoutId = setTimeout((socket) => {

                    if (socket !== undefined && socket.readyState === WebSocket.OPEN) {

                        console.log('WSChallenge websocket timeout');

                        socket.close(1000);

                        rounds(undefined);

                    }

                }, timeout, socket);

                console.log('WSChallenge websocket opened');


            };

        } catch (error) {

            console.log(error);

            rounds(undefined);

        } finally {

            // Code here always runs. Doesn't matter if there was an error or not.

        }

    }

}