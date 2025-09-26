
const fs = require('fs');
const path = require('path');
const got = require('got');
const express = require('express');
const crypto = require('crypto');
const esess = require('express-session');
const http = require('http');
const https = require('https');
const { Server } = require("socket.io");
const ioClient = require("socket.io-client")
const { EventEmitter } = require("events");
const colors = require('colors');
//
class weboverlays extends EventEmitter {
    constructor(options){
        super();
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.session = esess({
            secret: crypto.randomBytes(4).toString('base64'),
            resave: true,
            saveUninitialized: false,
            cookie: {
                secure: false,
                maxAge: (30 * 60 * 1000)
            },
            rolling: true
        });
        this.app.use(this.session);
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.set('view engine', 'pug');
        this.app.locals.basedir = path.join(__dirname, 'views');
        this.app.set('view options', {
            debug: true,
            compileDebug: false
        });
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(function(req,res,next) {
            var flash = {
                error:      (req.session.error ? req.session.error : false),
                warning:    (req.session.warning ? req.session.warning : false),
                success:    (req.session.success ? req.session.success : false)
            }
            res.locals.flash = flash;

            if (req.session.error) { req.session.error = ''; }
            if (req.session.warning) { req.session.warning = ''; }
            if (req.session.success) { req.session.success = ''; }

            next();
        });
        this.app.route('/').get((req, res) => {
            res.render('rootpage');
        })
        this.app.route('/overlays/').get((req, res) => {
            res.render('overlays');
        }).post((req, res) => {
            res.redirect('/overlays/');
        });
        this.app.route('/twitchgame/').get((req, res) => {
            res.render('twitchgame');
        }).post((req, res) => {
            res.redirect('/twitchgame/');
        });
        this.LoadAuthServer = (port)=>{
            return new Promise((resolve, reject)=>{
                this.port = port;
                this.server = require('http').createServer(this.app)
                this.ioServer = new Server(this.server);
                this.ioServer.on('connection', (socket) => {
                    socket.name = socket.id;

                });
                this.backbone = ioClient("http://localhost:8081");
                this.backbone.on("connect", () => {
                    console.log("Identified to BackBone as : WebOverlays")
                    this.backbone.emit("Identifier", "WebOverlays");
                });
                this.backbone.on("Twitch", (twichObj) => {
                    console.log('twitch',twichObj[0])
                    // preprocess random folder calls.
                    if (twichObj[0]=='channel.channel_points_custom_reward_redemption.add'){
                        switch(twichObj[1].reward.title){ // this handles random file calls for overlay media.
                            case 'BunnySays':
                                let files = fs.readdirSync('public/sounds/bunny/');
                                let rFile = Math.floor(Math.random() * files.length);
                                let fileSTR = `${files[rFile]}`;
                                // twichObj[1].bunnysays = fileSTR
                                console.log('BunnySays', fileSTR)
                                this.ioServer.emit('BunnySays', fileSTR)
                            break;
                            case 'Honk':
                                let filesh = fs.readdirSync('public/sounds/honk/');
                                let rFileh = Math.floor(Math.random() * filesh.length);
                                let fileSTRh = `${filesh[rFileh]}`;
                                // twichObj[1].honk = fileSTRh
                                console.log('Honk', fileSTRh)
                                this.ioServer.emit('Honk', fileSTRh)
                            break;
                            default:
                                this.ioServer.emit('Twitch', twichObj)
                        }
                    }else{                        
                        this.ioServer.emit('Twitch', twichObj)
                    }
                    //
                });
                this.server.listen(port, function () {
                    console.log(colors.magenta(`[Web Auth server] Opened.`, `Port: ${port}`));
                });                
                resolve(true);
            })
        }
    }
};
// 
module.exports = weboverlays;