const { EventEmitter } = require("events");
const mysql = require('mysql');
const got = require('got');
const colors = require('colors');
//
class mkDbObj extends EventEmitter {
    constructor() {
        super();
        this.DBAUTH = require('../kiwiauth/sql/dbconfig.json');
        this.currConn = mysql.createConnection(this.DBAUTH);
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
                    console.log(`[Storing Auth]`, results.message, `expires_in: ${auth.expires_in}`)
                    resolve(results)
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
                    console.log(`[Storing Bot Auth]`, results.message, `expires_in: ${auth.expires_in}`)
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
                        //
                        let auth = JSON.parse(results[0].Auth)
                        let meta = JSON.parse(results[0].Meta)
                        console.log(`[Sending Current Key]`, `expires_in: ${auth.expires_in}`)
                        resolve(auth)
                    });        
                // });                    
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
                        //
                        let botauth = JSON.parse(results[0].BotAuth)
                        console.log(`[Sending Bot Current Key]`, `expires_in: ${botauth.expires_in}`)
                        resolve(botauth)
                    });        
                // });                    
            })
        }
    }
};
// 
module.exports = mkDbObj;