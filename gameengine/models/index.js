const fs = require("fs");


function render(callback) {

    // read file
    fs.readFile("./models/godotgame.json", callback);
}


// exports
exports.render = render;
