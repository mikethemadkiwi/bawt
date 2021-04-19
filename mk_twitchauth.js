const fs = require('fs');
const path = require('path');
const got = require('got');
const express = require('express');
const crypto = require('crypto');
const esess = require('express-session');
const http = require('http');
const https = require('https');
const { EventEmitter } = require("events");
//
class mkTwitch extends EventEmitter {
    constructor(authfile){
        super();
        this.Auth = authfile;
        this.BotToken = null;
        this.ScopeToken = null;
        this.showtoken = false;
        this.showscopedtoken = false;
        this.chatClients = [];
        this.ChatChannels = [];
        this.userInfo = [];
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
            debug: false,
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
            if (req.session.token) {
                got({
                    url: 'https://id.twitch.tv/oauth2/validate',
                    headers: {
                        Authorization: 'OAuth ' + req.session.token.access_token
                    },
                    responseType: 'json'
                })
                .then(resp => {
                    res.render(
                        'loggedin',
                        {
                            user: req.session.user,
                            token: resp.body
                        }
                    );
                })
                .catch(err => {
                    console.error('Error body:', err.response.body);
                    req.session.error = 'An Error occured: ' + ((err.response && err.response.body.message) ? err.response.body.message : 'Unknown');
                    res.redirect('/');
                });

                return
            }
            let { code, error, error_description, scope, state } = req.query;
            if (code) {
                state = decodeURIComponent(state);
                if (req.session.state != state) {
                    req.session.error = 'State does not match. Please try again!';
                    res.redirect('/');
                    return;
                }
                delete req.session.state;
                got({
                    "url": "https://id.twitch.tv/oauth2/token",
                    "method": 'POST',
                    "headers": {
                        "Accept": "application/json"
                    },
                    "form": {
                        "client_id": this.Auth.client_id,
                        "client_secret": this.Auth.client_secret,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": this.Auth.redirect_uri
                    },
                    "responseType": 'json'
                })
                .then(resp => {
                    req.session.token = resp.body;
                    this.ScopeToken = resp.body;
                    this.emit('ScopeToken', resp.body)
                    return got({
                        "url": "https://api.twitch.tv/helix/users",
                        "method": "GET",
                        "headers": {
                            "Accept": "application/json",
                            "Client-ID": this.Auth.client_id,
                            "Authorization": "Bearer " + req.session.token.access_token
                        },
                        "responseType": 'json'
                    })
                })
                .then(resp => {
                    if (resp.body && resp.body.data && resp.body.data[0]) {
                        req.session.user = resp.body.data[0];
                    } else {
                        req.session.warning = 'We got a Token but failed to get your Twitch profile from Helix';
                    }
                    res.redirect('/');
                })
                .catch(err => {
                    console.error('Error body:', err.response.body);
                    req.session.error = 'An Error occured: ' + ((err.response && err.response.body.message) ? err.response.body.message : 'Unknown');
                    res.redirect('/');
                });

                return;
            }
            var auth_error = '';
            if ( error ) {
                auth_error = 'oAuth Error ' + error_description;
            }
            req.session.state = crypto.randomBytes(16).toString('base64');
            res.render('generator', {
                client_id: this.Auth.client_id,
                redirect_uri: this.Auth.redirect_uri,
                auth_error,
                scopes: JSON.parse(fs.readFileSync(path.join(__dirname, '.', 'scopes.json'))),
                state: req.session.state
            });
        })
        .post((req, res) => {
            res.redirect('/');
        });
        this.app.route('/logout/').get((req, res) => {
            this.RevokeToken(this.Auth.client_id, req.session.token.access_token);
            req.session.destroy();
            res.redirect('/');
        });
        this.ValidateToken = function(){
            return new Promise((resolve, reject)=>{
                got({
                    url: "https://id.twitch.tv/oauth2/validate",
                    method: "GET",
                    headers: {
                        Authorization: "OAuth " + TAuth.Token_Current
                    },
                    responseType: "json"
                })
                .then(resp => {
                    if (resp.body.expires_in <= 3600) {
                        console.log(`Renewal Required for Token`, resp.body.client_id, resp.body.scopes, resp.body.expires_in);
                        this.GetToken();
                        resolve(true)
                    } 
                    else {
                        console.log(`Key is Fine`, resp.body.client_id, resp.body.scopes, resp.body.expires_in);                  
                        resolve(true)
                    }
                })
                .catch(err => {
                    console.error(err);
                    resolve(false)
                });
            })
        };
        this.GetToken = function(authfile){
            return new Promise((resolve, reject)=>{
                got({
                    url: "https://id.twitch.tv/oauth2/token",
                    method: "POST",
                    headers: {
                        "Accept": "application/json"
                    },
                    form: {
                        client_id: `${this.Auth.client_id}`,
                        client_secret: `${this.Auth.client_secret}`,
                        grant_type: "client_credentials"
                    },
                    responseType: "json"
                })
                .then(resp => {
                    console.log(`Token Generated using ClientId [${this.Auth.client_id}]`)  
                    this.BotToken = resp.body;
                    resolve(true)
                })
                .catch(err => {
                    console.error("Failed to get a clientCred", (err.body ? err.body : err));
                    resolve(false)
                });
            })
        };
        this.RevokeToken = function(client_id, access_token){
            return new Promise((resolve, reject)=>{
                got({
                    url: "https://id.twitch.tv/oauth2/revoke",
                    method: "POST",
                    headers: {
                        "Accept": "application/json"
                    },
                    form: {
                        client_id: `${client_id}`,
                        token: access_token
                    },
                    responseType: "json"
                })
                .then(resp => {
                    console.log(resp.body)
                    resolve(true)
                })
                .catch(err => {
                    console.error("Failed to get a clientCred", (err.body ? err.body : err));
                    resolve(false)
                });
            })
        };
        this.LoadAuthServer = (port)=>{
            return new Promise((resolve, reject)=>{
                this.GetToken(this.Auth);
                this.server = require('http').createServer(this.app)
                this.server.listen(port, function () {
                    console.log('Server listening at port :' + port);
                });
                resolve(true);
            })

        };
    }
};
//
module.exports = mkTwitch;