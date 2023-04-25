import express from "express";
import { router } from "./router";
import path from "path";
import logger from "morgan";
import cookieParser from 'cookie-parser';
import IP from "ip";
import sessions from "express-session";
import { User } from "./user";
import { Data } from "./data";
import bodyParser from "body-parser";
import multer from "multer";
import { WSS } from "./wss";
// import { Quiz, arithmetic_quiz } from "./quiz";
// var upload = multer();

export class App {

  public server: express.Application;
  wss:WSS = new WSS();

  constructor(webPort: number, wssPort: number) {

    this.server = express();

    this.server.set('app_name', 'PassOrPass');
    this.server.set('app_web_server_address', IP.address());
    this.server.set('app_web_server_port', webPort);
    this.server.set('app_websockt_server_port', wssPort);
    this.server.set('app_user_data_path', path.join(__dirname, 'data', 'user_data.json'));
    this.server.set('users_session_login', new Map<string, User>()); // session.id->user
    this.server.set('views', path.join(__dirname, 'views'));
    this.server.set('view engine', 'ejs');



    this.middleware();
    this.router();
    this.app_user_data_load();


  }

  private app_user_data_load() {

    // users
    const umap = Data.readFileSync<User>(this.server.get("app_user_data_path"));
    this.server.set("app_user_data_map", umap)
    this.server.get("app_user_data_map")["admin@passorpass.com"] = new User("admin", "admin@passorpass.com", "admin");
    Data.writeFileSync<User>(this.server.get("app_user_data_path"), umap);

  }

  private middleware() {

    this.server.use(logger('dev'));
    this.server.use(express.json());
    this.server.use(bodyParser.json());
    this.server.use(bodyParser.urlencoded({ extended: true }));
    // this.server.use(upload.array()); 
    this.server.use(express.urlencoded({ extended: false }));
    this.server.use(cookieParser());
    this.server.use(express.urlencoded({ extended: true }));
    this.server.use(express.static(path.join(__dirname, 'public')));
    this.server.use(sessions({
      secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
      saveUninitialized: true,
      cookie: { maxAge: 1000 * 60 * 60 * 24 }, // one day
      resave: false
    }));

  }

  private router() {
    this.server.use(router);
  }

  public run() {

    var server = this.server.listen(this.server.get("app_web_server_port"));

    this.wss.launch(this.server.get("app_websockt_server_port"))

    const wss = this.wss;

    console.log(`web server listening on port:${this.server.get("app_web_server_port")}`);
    console.log(`websocket server listening on port:${this.server.get("app_websockt_server_port")}`);

    for (let signal of ["SIGTERM", "SIGINT"])
      process.on(signal, () => {
        console.info(`${signal} signal received.`);
        console.log("Closing http server.");
        server.close((err) => {
          console.log("Http server closed.");
          process.exit(err ? 1 : 0);
        });
        console.log("Closing websock server.");
        wss.close();
      });
  }

}