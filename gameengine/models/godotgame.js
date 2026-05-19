const fs = require("fs");


// function create(gamedatajson, callback) {

//     // read file
//     fs.readFile("./models/godotgame.json", function(err, data) {

//         // check errors
//         if(err) {
//             console.log(err);
//             throw err;
//         }

//         // carry on
//         else {

//             // convert to json
//             let gameData = JSON.parse(data);

//             // add new gamedatajson
//             gameData.push(gamedatajson);

//             // write file
//             fs.writeFile("./models/godotgame.json", JSON.stringify(gameData, null, 4), callback(err, gamedatajson));
//         }
//     });
// }


function read(callback) {

    // read file
    fs.readFile("./models/godotgame.json", callback);
}


// function update(date, gamedatajson, callback) {

//     // read file
//     fs.readFile("./models/godotgame.json", function(err, data) {

//         // check errors
//         if(err) {
//             console.log(err);
//             throw err;
//         }

//         // carry on
//         else {

//             // convert to json
//             let gameData = JSON.parse(data);

//             // find index of object
//             let index = gameData.findIndex(function(gamedatajson) {
//                 return gamedatajson.date === date;
//             });

//             // update gamedatajson
//             gameData[index].gamedatajson = gamedatajson;

//             // write file
//             fs.writeFile("./models/godotgame.json", JSON.stringify(gameData, null, 4), callback(err, gameData[index]));
//         }
//     });
// }


// function destroy(date, callback) {

//     fs.readFile("./models/godotgame.json", function(err, data) {

//         // check errors
//         if(err) {
//             console.log(err);
//             throw err;
//         }

//         // carry on
//         else {

//             // convert to json
//             let gameData = JSON.parse(data);

//             // find and remove date
//             for(let i = 0; i < gameData.length; i++) {
//                 if (gameData[i].date === date) {
//                     gameData.splice(i, 1);
//                     break;
//                 }
//             }

//             // write file
//             fs.writeFile("./models/godotgame.json", JSON.stringify(gameData, null, 4), callback);
//         }
//     });
// }


// exports
// exports.create  = create;
exports.read    = read;
// exports.update  = update;
// exports.destroy = destroy;
