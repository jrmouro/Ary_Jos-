import { Request, Response } from "express";

class RegisterController{

  public user(req:Request, res:Response) {
    // const port = req.query.wssport | 3000;
  const wsaddress = req.app.get("app_web_server_address");
  const wsport = req.app.get("app_web_server_port");
  const app_name = req.app.get("app_name");

    res.render('user_register', {
      title: app_name,
      wsa: wsaddress,
      wsp: wsport
    });

  }

  public player(req:Request, res:Response) {
    // const port = req.query.wssport | 3000;
  const wsaddress = req.app.get("app_web_server_address");
  const wsport = req.app.get("app_web_server_port");
  const app_name = req.app.get("app_name");

    res.render('user_register', {
      title: app_name,
      wsa: wsaddress,
      wsp: wsport
    });

  }

  public match(req:Request, res:Response) {
    // const port = req.query.wssport | 3000;
  const wsaddress = req.app.get("app_web_server_address");
  const wsport = req.app.get("app_web_server_port");
  const app_name = req.app.get("app_name");

    res.render('match_register', {
      title: app_name,
      wsa: wsaddress,
      wsp: wsport
    });

  }

}

export const registerController = new RegisterController();