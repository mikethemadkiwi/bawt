const { EventEmitter } = require("events");
const mysql = require('mysql');
//
class mkDbObj extends EventEmitter {
    constructor(databaseAuth) {
        super();
        this.currConn = mysql.createConnection(databaseAuth);
        this.currConn.connect(function(err) {
            if (err) throw err;                       
        }); 
        this.currConn.on('error', function(err) {
            console.log('DB CONNECTION ERROR', err.code); // 'ER_BAD_DB_ERROR'
            this.currConn.end();
            let reconn = setTimeout(() => {
                this.currConn.connect(function(err) {
                    if (err) throw err;                         
                });
            }, 5000);              
        });
        this.SanityCheck = function(){
            return new Promise((resolve, reject)=>{
                let rand1 = Math.floor(Math.random() * 2600);
                let rand2 = Math.floor(Math.random() * 1337);
                let qStr = `SELECT ${rand1} + ${rand2} AS solution`
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    console.log(`[Database] Sanity Check : ${rand1} + ${rand2} Result:`, results[0].solution);
                    resolve(true)
                });              
            })
        }
        this.StoreAuth = function(auth){
            return new Promise((resolve, reject)=>{
                let prepData = JSON.stringify(auth)
                let qStr = `UPDATE twitch SET Auth='${prepData}' WHERE id='1'`;
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    resolve(true)
                });
            })
        } 
        this.StoreClient = function(client){
            return new Promise((resolve, reject)=>{
                let prepData = JSON.stringify(client)
                let qStr = `UPDATE twitch SET Oauth_owner='${prepData}' WHERE id='1'`;
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    resolve(true)
                });
            })
        }       
        this.StoreBotAuth = function(auth){
            return new Promise((resolve, reject)=>{
                let prepData = JSON.stringify(auth)
                let qStr = `UPDATE twitch SET BotAuth='${prepData}' WHERE id='1'`;
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    resolve(results)
                });
            })
        }       
        this.StoreBotClient = function(client){
            return new Promise((resolve, reject)=>{
                let prepData = JSON.stringify(client)
                let qStr = `UPDATE twitch SET Oauth_bot='${prepData}' WHERE id='1'`;
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    resolve(results)
                });
            })
        }             
        this.StoreKickAuth = function(auth){
            return new Promise((resolve, reject)=>{
                let prepData = JSON.stringify(auth)
                let qStr = `UPDATE kick SET Auth='${prepData}' WHERE id='1'`;
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    resolve(results)
                });
            })
        }       
        this.StoreKickClient = function(client){
            return new Promise((resolve, reject)=>{
                let prepData = JSON.stringify(client)
                let qStr = `UPDATE kick SET Oauth_owner='${prepData}' WHERE id='1'`;
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    resolve(results)
                });
            })
        }
        this.CurrentKey = function(){        
            return new Promise((resolve, reject)=>{
                let qStr = `SELECT * from twitch`
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    let auth = JSON.parse(results[0].Auth)
                    resolve(auth)
                });
            })
        }
        this.CurrentBotKey = function(){        
            return new Promise((resolve, reject)=>{
                let qStr = `SELECT * from twitch`
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    let botauth = JSON.parse(results[0].BotAuth)
                    resolve(botauth)
                });
            })
        }
        this.CurrentKickKey = function(){        
            return new Promise((resolve, reject)=>{
                let qStr = `SELECT * from kick`
                this.currConn.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    let botauth = JSON.parse(results[0].BotAuth)
                    resolve(botauth)
                });
            })
        }
    }
};
module.exports = mkDbObj;