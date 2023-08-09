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

        console.log(key, command, server, team, damage);
        if (key == null || command == null || server == null || team == null || damage == null) {
            res.status(400).send("Missing parameters");
            return;
        }
        var new_health = admin.database.ServerValue.increment(-damage);
        if (new_health <= 0) {
            playerRef.update({
                health: 0,
                dead: true
            })
        } else {
            playerRef.update({
                health: new_health
            });
        }
        res.status(200).send("Damage done");

    }
});


app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})