import { Request, Response } from "express";
import IP from "ip";
import { User } from "../user";

class HomeController{

  public home(req:Request, res:Response) {
    // const port = req.query.wssport | 3000;
  const wsaddress = req.app.get("app_web_server_address");
  const wsport = req.app.get("app_web_server_port");
  const app_name = req.app.get("app_name");

    const user:User = req.app.get("users_session_login").get(req.session.id);

    res.render('home', {
      title: app_name,
      wsa: wsaddress,
      wsp: wsport,
      user: user
    });

  }

}

export const homeController = new HomeController();