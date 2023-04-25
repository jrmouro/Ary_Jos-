
import { App } from "./app/app"


var webport = parseInt(process.env.WEBPORT || '5005', 10);
var wssport = parseInt(process.env.WSSPORT || '5006', 10);



new App(webport, wssport).run();