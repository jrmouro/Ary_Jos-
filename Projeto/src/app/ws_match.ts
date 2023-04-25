import { Match } from "./match";
import { MessageEvent, WebSocket } from "ws";
import { WS_MSG } from "./ws_msg";
import { Protocol } from "./protocol";

export class WS_Match {

    key: string;
    match: Match;
    isRunning: boolean = false;
    isOpenToRegistry: boolean = true;
    isRoundShooting:boolean = false;
    roundIndex: number = -1;

    round_timeoutId: NodeJS.Timeout | undefined = undefined;
    shooting_timeoutId: NodeJS.Timeout | undefined = undefined;
    wait_intervalId: NodeJS.Timer | undefined = undefined;

    socket: WebSocket | undefined = undefined;

    constructor(key:string, match: Match, wss_ip?: string, port?: number) {
        this.key = key;
        this.match = match;
        if (wss_ip !== undefined && port !== undefined) {
            this.launch(wss_ip, port);
        }
    }


    private control(msg_obj: WS_MSG) {

        const receiver = msg_obj.receiver;
        const sender = msg_obj.sender;
        const msg_type = msg_obj.msg_type;
        const msg_content = msg_obj.msg_content;

        if (receiver === this.match.key && sender !== undefined) {

            switch (msg_type) {

               //registry
                case Protocol.registry_at_match:
                    this.register(sender);
                    break;

                case Protocol.unregistry_at_match:
                    this.unregister(sender);
                    break;

                //round
                case Protocol.match_shot_pass:

                    break;

                case Protocol.match_shot_response:



                    break;

                // player
                case Protocol.match_shooting:

                    this.shooting(sender);

                break;

                
            }

        }

    }

    wait_to_round_resume(sender:string){

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {


            var self = this;

            setTimeout(() => {

                if (self.isRoundShooting) {

                    self.isRoundShooting = false;

                    self.socket?.send( // Verificar se é o caso
                        JSON.stringify({
                            sender: this.key,
                            sender_cluster: this.key,
                            receiver: "__cluster__",
                            receiver_cluster: this.key,
                            msg_type: Protocol.match_wait_to_round_resume,
                            msg_content: {}
                        }));

                    setTimeout(() => {

                        self.round();
        
                    }, 1000);

                }

            }, this.match.config.wait_to_round_resume_time);

        }

    }

    round_resume(sender:string, msg_content?:{}){

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.round_resume,
                    msg_content: {
                        player: sender
                    }
                }));

                var self = this

            setTimeout(() => {

                self.wait_to_round_resume(sender);

            }, 1000);

        }

    }

    wait_to_shooting(sender:string){

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.shooting_timeoutId = setTimeout(() => {

                var self = this;

                if (self.isRoundShooting) {

                    self.socket?.send(
                        JSON.stringify({
                            sender: this.key,
                            sender_cluster: this.key,
                            receiver: "__cluster__",
                            receiver_cluster: this.key,
                            msg_type: Protocol.round_end,
                            msg_content: {}
                        }));

                    setTimeout(() => {

                        self.round_resume(sender);
        
                    }, 1000);

                }

            }, this.match.config.wait_to_shooting_time);

        }

    }

    shooting(sender:string){

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            if(!this.isRoundShooting){

                this.isRoundShooting = true;

                this.socket.send(
                    JSON.stringify({
                        sender: this.key,
                        sender_cluster: this.key,
                        receiver: "__cluster__",
                        receiver_cluster: this.key,
                        msg_type: Protocol.match_shooting,
                        msg_content: {
                            player: sender
                        }
                    }));

                var self = this;

                setTimeout(() => {

                    self.wait_to_shooting(sender);
    
                }, 1000);


            }


        }

    }

    unregister(sender: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            if (this.isOpenToRegistry){

                this.socket.send(
                    JSON.stringify({
                        sender: this.key,
                        sender_cluster: this.key,
                        receiver: sender,
                        receiver_cluster: this.key,
                        msg_type: Protocol.unregistry_at_match,
                        msg_content: {}
                    }));

            }           

        }

    }

    register(sender: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            let info = "no";

            if (this.isOpenToRegistry && this.match.Keyplayer_score_map.size < this.match.config.max_amount_players) {

                this.match.Keyplayer_score_map.set(sender, []);

                this.isOpenToRegistry = this.match.Keyplayer_score_map.size < this.match.config.max_amount_players;

                info = "yes";

            }

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: sender,
                    receiver_cluster: this.key,
                    msg_type: Protocol.registry_at_match,
                    msg_content: {
                        info: info
                    }
                }));

        }

    }

    state(receiver?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: receiver || "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.start_match,
                    msg_content: {
                        isRunning: this.isRunning,
                        isOpenToRegistry: this.isOpenToRegistry,
                        roundIndex: this.roundIndex
                    }
                }));

        }

    }

    abort(info?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.abort_match,
                    msg_content: {
                        info: info
                    }
                }));

            var self = this;

            setTimeout(() => {

                self.socket?.close(1000);

            }, 2000);

        }

    }

    failure(receiver?: string, info?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: receiver || "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.match_failure,
                    msg_content: {
                        info: info
                    }
                }));

        }

    }


    prepare() {

        this.isRunning = false;
        this.isOpenToRegistry = true;
        this.roundIndex = -1;

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.match_prepare,
                    msg_content: {}
                }));

            var self = this;

            setTimeout(() => {

                self.wait_to_registry();

            }, 1000);

        }

    }

    round() {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.roundIndex++;

            if(this.roundIndex < this.match.rounds.length){
                
                if(this.round_timeoutId !== undefined){

                    clearTimeout(this.round_timeoutId);

                }

                this.isRoundShooting = false;

                this.socket.send(
                    JSON.stringify({
                        sender: this.key,
                        sender_cluster: this.key,
                        receiver: "__cluster__",
                        receiver_cluster: this.key,
                        msg_type: Protocol.round_start,
                        msg_content: {}
                    }));

                var self = this;

                this.round_timeoutId = setTimeout(() => {

                    if (self.isRunning && !self.isOpenToRegistry) {
    
                        self.socket?.send(
                            JSON.stringify({
                                sender: this.key,
                                sender_cluster: this.key,
                                receiver: "__cluster__",
                                receiver_cluster: this.key,
                                msg_type: Protocol.round_end,
                                msg_content: {}
                            }));

                        setTimeout(() => {

                            self.round();
            
                        }, 1000);
    
                    }
    
                }, self.match.rounds[this.roundIndex].response_timeout);

            } else {

                this.end();

            }

        }

    }

    start() {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.isRunning = true;

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.start_match,
                    msg_content: {}
                }));

            var self = this;

            setTimeout(() => {

                self.round();

            }, 1000);

        }

    }

    wait_to_start() {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.wait_to_start_match,
                    msg_content: {}
                }));

            var self = this;

            setTimeout(() => {

                if (!self.isRunning && !self.isOpenToRegistry) {

                    self.start();

                }

            }, self.match.config.wait_to_start_match_time)

        }

    }

    wait_to_registry() {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.match_wait_to_registry,
                    msg_content: {}
                }));

            var self = this;

            setTimeout(() => {

                if (!self.isRunning) {

                    if (self.isOpenToRegistry) {

                        if (self.match.Keyplayer_score_map.size < self.match.config.min_amount_players) {

                            self.failure(undefined, "no min amount players");

                            setTimeout(() => {

                                self.abort("no min amount players");

                            }, 1000);

                            return;

                        } else {

                            self.isOpenToRegistry = false;

                        }

                        self.wait_to_start();

                    }

                }

            }, self.match.config.wait_to_registry_at_match_time)

        }

    }

    launch(wss_ip: string, port: number) {

        this.end();

        this.socket = new WebSocket('ws://' + wss_ip + ':' + port.toString() + '/');

        var self = this;

        this.socket.onopen = function (event) {

            if (self.socket !== undefined) {

                self.socket.onmessage = function (event: MessageEvent) {

                    console.log('Match control websocket(' + self.match.key + ') received message: ' + event.data.toString());

                    self.control(JSON.parse(event.data.toString()) as WS_MSG);

                };

                self.socket.onerror = function (error) {

                    console.log('Match control websocket(' + self.match.key + ') error: ' + error);

                };

                self.socket.onclose = function (event) {

                    console.log('Match control websocket(' + self.match.key + ') closed.');
                };

                setTimeout(() => {

                    self.prepare();

                }, 1000);

            };
        }
    }

    end(info?: string) {

        if (this.socket !== undefined && this.socket.readyState === WebSocket.OPEN) {

            this.isRunning = false;

            this.socket.send(
                JSON.stringify({
                    sender: this.key,
                    sender_cluster: this.key,
                    receiver: "__cluster__",
                    receiver_cluster: this.key,
                    msg_type: Protocol.end_match,
                    msg_content: {
                        info: info
                    }
                }));

        }

    }


}


const match1: Match = {
    key: "m1",
    name: "match1",
    config: {
        show_options: false,
        min_amount_players: 2,
        max_amount_players: 2,
        wait_to_registry_at_match_time: 60000,
        wait_to_start_match_time: 10000,
        wait_to_shooting_time: 5000,
        wait_to_round_resume_time: 10000
    },
    rounds: [],
    Keyplayer_score_map: new Map()
};

const ws_match = new WS_Match("m1", match1, "localhost", 5555);
