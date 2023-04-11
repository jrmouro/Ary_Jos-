
import { App } from "./app/app"


var port = normalizePort(process.env.PORT || '5002');

function normalizePort(val: string) {

    var port = parseInt(val, 10);

    if (!isNaN(port) && port >= 0) {
        // named pipe
        return port;
    }

    return 3000;

}



new App(port).run();