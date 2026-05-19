const express = require("express");
const GodotGame  = require("../models/godotgame");


// create router
const router = express.Router();


// // http post
// router.post("/", function(request, response) {

//     GodotGame.create(request.body, function(err, gameData) {

//         // check errors
//         if(err) {
//             console.log(err);
//             throw err;
//         }

//         // carry on
//         else {
//             // send response
//             response.json(gameData);
//         }
//     });
// });


// http get
router.get("/", function(request, response) {

    GodotGame.read(function(err, gameData) {

        // check errors
        if(err) {
            console.log(err);
            throw err;
        }

        // carry on
        else {

            // convert to json
            gameData = JSON.parse(gameData);

            // send response
            response.json(gameData);
        }
    });
});


// // http patch
// router.patch("/:date", function(request, response) {

//     GodotGame.update(request.params.date, request.body.gamedatajson, function(err, gameData) {

//         // check errors
//         if(err) {
//             console.log(err);
//             throw err;
//         }

//         // carry on
//         else {
//             // send response
//             response.json(gameData);
//         }
//     });
// });


// // http delete
// router.delete("/:date", function(request, response) {

//     GodotGame.destroy(request.params.date, function(err) {

//        // catch error
//        if (err) {
//            console.log(err);
//            throw err;
//        }

//        // carry on
//        else {
//            // send response
//            response.json();
//        }
//    });
// });


// exports
module.exports = router;
