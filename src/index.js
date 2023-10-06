var admin = require("firebase-admin");

var fetch = require("cross-fetch");

var serviceAccount = require("../serviceAccountKey.json");

var https = require('https');

var http = require('http');

var fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://topdowncs-e9076-default-rtdb.firebaseio.com"
});

var db = admin.database();

var serversRef = db.ref("servers");

const express = require('express');
const app = express();
const port = 5000;

let count = 0;

const commands = [
    "DAMAGE",
    "HEAL",
    "MOVE",
    "KILL"
]

app.get('/servers', (req, res) => {
    serversRef.once("value", function(snapshot) {
      res.json(snapshot.val());
    });
})
app.get("/startup", (req, res) => {
    res.status(200).send("200 - Good");
    console.log("Ping");
});

app.post('/send_command', (req, res) => {
    var key = req.get("key");
    var command = req.get("command");
    var server = req.get("server");
    var team = req.get("team");


    var playerRef = serversRef.child(server).child("players").child(team).child(key);
    if (command == "DAMAGE") {
        var damage = req.get("damage");

        var done = false;
        if (key == null || command == null || server == null || team == null || damage == null) {
            res.status(400).send("Missing parameters");
            return;
        }
        var new_health = admin.database.ServerValue.increment(-damage);
        //console.log(new_health);

        playerRef.child("health").on("value", function(snapshot) {
            if (!done) {
                done = true;
                var health = parseInt(snapshot.val());
                console.log(health - damage);
                if (health - damage <= 0) {
                    console.log("Player dead");
                    playerRef.update({
                        health: 0,
                        dead: true
                    })
                } else {
                    console.log("Player damaged");
                    playerRef.update({
                        health: new_health
                    });
                }
               // res.json({
                //    dead: health - damage <= 0
                //});

                res.setHeader("dead", (health - damage <= 0).toString());
                if (res.getHeader("dead") == "true") {
                    playerRef.child("name").on("value", function(snapshot) {
                        if (snapshot.val() != null) {
                            res.setHeader("playerName", snapshot.val().toString());

                            res.status(200).send("Success");
                        }
                    });
                }
                else {
                    //res.setHeader("playerName", playerRef.child("name").toString());
                    res.status(200).send("Success");
                }
            }
        });

    }
});

function ping() {
    //fetch("https://hollowpointapi.onrender.com/startup").then((res) => {
      //  console.log("Ping");
      //  setTimeout(ping, 1000 * 60 * 5);
    //});
}

const run_on_https = false;

if (run_on_https) {
	var options = {
		key: fs.readFileSync('./keys/agent2-key.pem'),
		cert: fs.readFileSync('./keys/agent2-cert.cert')
	}

	https.createServer(options, app).listen(port);
	
} else {
	app.listen(port, () => {
    	console.log(`Server listening on port ${port}`)

    	//ping();
	})
}
