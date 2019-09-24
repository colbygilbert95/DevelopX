"use strict";
// You Can Use The Commands Below To Generate A Self Signed Certificate For Use With This Tutorial
// These Commands Require That You have 'openssl' installed on your system
// openssl genrsa -out privatekey.pem 1024
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
var type = "http";
var fs = require("fs");
var path = require("path");
var express = require('express');
var cors = require("cors");
var app = express();
var Server = require("node-git-server");
var port = process.env.PORT || 5005;
app.use(cors());
process.argv.slice(2).forEach(function (arg) {
    // research
    console.log("process Arg:");
    console.log(arg);
    console.log();
    switch (arg) {
        case "https":
        case "--https":
            type = "https";
            break;
    }
});
var repos = new Server(path.normalize(path.resolve(__dirname, "tmp")), {
    autoCreate: true,
    authenticate: function (type, repo, user, next) {
        if (type == "push") {
            user(function (username, password) {
                next();
            });
        }
        else {
            next();
        }
    }
});
app.use('/git', function (req, res) {
    repos.handle(req, res);
});
app.listen(5005, function () {
    console.log("Express http server listening");
});
repos.on("push", function (push) {
    push.log("push " + push.repo + " >>> " + push.commit + " ( " + push.branch + " )"); // eslint-disable-line
    push.accept();
});
repos.on("fetch", function (fetch) {
    fetch.log("username " + fetch.username); // eslint-disable-line
    fetch.log("fetch " + fetch.repo + " >>> " + fetch.commit); // eslint-disable-line
    fetch.accept();
});
