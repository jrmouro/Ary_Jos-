

function load() {

    var canvas = document.getElementById("board");

    var timestamp = 0;
    var mX = 0;
    var mY = 0;

    document.body.addEventListener("mousemove", (e)=>{

        var now = Date.now();
        currentmY = e.screenY;
        currentmX = e.screenX;

        var dt = now - timestamp;
        var distancey = currentmY - mY;
        var distancex = currentmX - mX;
        var speedy = Math.round(distancey / dt * 1000);
        var speedx = Math.round(distancex / dt * 1000);
        // console.log(dt, distance, speed);
        document.getElementById("speedx").innerHTML = speedy;
        document.getElementById("speedy").innerHTML = speedx;

        mY = currentmY;
        mX = currentmX;
        timestamp = now;
        
    });

}