var admin = require("firebase-admin");

var serviceAccount = require("../serviceAccountKey.json");

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
        console.log(new_health);

        playerRef.child("health").on("value", function(snapshot) {
            if (!done) {
                done = true;
                var health = parseInt(snapshot.val());
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

                res.status(200).send("Success");
            }
            return;
        });

    }
});


app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})