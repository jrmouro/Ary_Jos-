export interface WS{

    open(wss_ip: string, port: number):void;
    close():void;

}