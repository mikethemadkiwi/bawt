const fs = require('fs');
const path = require('path');
const got = require('got');
const { Server } = require("socket.io");
const { EventEmitter } = require("events");
const colors = require('colors');
class mkKickAuth extends EventEmitter {
    constructor(options){
        super();
        this.Auth = options.auth;
        this.KbotAuth = options.botauth;
        //

        this.LoadAuthServer = (port)=>{
            return new Promise((resolve, reject)=>{
                this.GetToken(this.Auth);
                this.GetBotToken(this.KbotAuth);
                this.port = port;
                //

                //
            })
        }
    }
}
module.exports = mkKickAuth;