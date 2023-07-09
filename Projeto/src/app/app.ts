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
import { WSS } from "./wss";
import { WS_Match } from "./ws_match";
import { WS_MatchInfo } from "./ws_match_info";
import { UID } from "./uid";
import { WS_ChallengeInfo } from "./ws_challenge_info";
import { WS_Challenge } from "./ws_challenge";

export class App {

  public server: express.Application;

  wss: WSS = new WSS((ev: string, wss: WSS) => {

    console.log(`wss at port ${wss.port} event: ${ev}`);

  });

  constructor(webPort: number, wssPort: number) {

    this.server = express();

    this.server.set('app_name', 'PassOrPass');
    this.server.set('app_web_server_address', IP.address());
    this.server.set('app_web_server_port', webPort);
    this.server.set('app_websockt_server_port', wssPort);

    this.server.set('app_ws_match_info_client', 
      new WS_MatchInfo(UID.get(), (ev: string, ws_match_info: WS_MatchInfo) => {

      console.log(`LOG: wsmatchinfo at port ${ws_match_info.port} event: ${ev}`);

    }));

    this.server.set('app_ws_challenge_info_client', 
      new WS_ChallengeInfo(UID.get(), (ev: string, ws_challenge_info: WS_ChallengeInfo) => {

      console.log(`LOG: wschallengeinfo at port ${ws_challenge_info.port} event: ${ev}`);

    }));

    this.server.set('app_user_data_path', path.join(__dirname, 'data', 'user_data.json'));
    this.server.set('app_launched_matches', new Map<string, Map<string, WS_Match>>()); // userkey->(wsmatchkey->wsmatch)
    this.server.set('app_launched_challenges', new Map<string, Map<string, WS_Challenge>>()); // userkey->(wschallengekey->wschallenge)
    this.server.set('users_session_login', new Map<string, User>()); // session.id->user
    this.server.set('views', path.join(__dirname, 'views'));
    this.server.set('view engine', 'ejs');



    this.middleware();
    this.router();
    this.app_user_data_load();


  }

  private app_user_data_load() {

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

    this.wss.launch(this.server.get("app_websockt_server_port"));
    const wss = this.wss;
    const wsMatchInfo = this.server.get("app_ws_match_info_client") as WS_MatchInfo;
    wsMatchInfo.launch(this.server.get("app_web_server_address"), this.server.get("app_websockt_server_port"));

    const wsChallengeInfo = this.server.get("app_ws_challenge_info_client") as WS_ChallengeInfo;
    wsChallengeInfo.launch(this.server.get("app_web_server_address"), this.server.get("app_websockt_server_port"));

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
        console.log("Closing websock server and wsmatchinfo client.");
        wsMatchInfo.close();
        wsChallengeInfo.close();
        wss.close();
      });
  }

}