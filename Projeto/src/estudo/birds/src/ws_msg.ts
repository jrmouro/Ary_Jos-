import WebSocket from "ws";

export interface WS_MSG{

    sender: string | undefined;
    sender_cluster: string  | undefined;
    receiver: string  | undefined;
    receiver_cluster: string  | undefined;
    msg_type: string  | undefined;
    msg_content: any  | undefined;

}

export interface WS_MSG_CRTL{
    receive(msg:WS_MSG, socket:WebSocket):void;
}