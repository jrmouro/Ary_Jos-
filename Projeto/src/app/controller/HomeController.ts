import { Request, Response } from "express";
import { User } from "../user";
import { WS_MatchInfo } from "../ws_match_info";
import { UID } from "../uid";

class HomeController {

  public home(req: Request, res: Response) {
    
    const wsaddress = req.app.get("app_web_server_address");
    const wsport = req.app.get("app_web_server_port");
    const wss_port = req.app.get("app_websockt_server_port");
    const app_name = req.app.get("app_name");

    const user: User = req.app.get("users_session_login").get(req.session.id);
    const wsmatchinfo: WS_MatchInfo = req.app.get("app_ws_match_info_client") as WS_MatchInfo;
    const fail_msg = req.query.fail_msg;

    res.render('home', {
      title: app_name,
      wsa: wsaddress,
      wsp: wsport,
      wssp: wss_port,
      user: user,
      wsmatchinfoclusterkey: wsmatchinfo.key,
      wsmatchinfokey: UID.get(),
      fail_msg: fail_msg
    });

  }

}

export const homeController = new HomeController();