// You Can Use The Commands Below To Generate A Self Signed Certificate For Use With This Tutorial
// These Commands Require That You have 'openssl' installed on your system
// openssl genrsa -out privatekey.pem 1024
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem

let type = "http";
const fs = require("fs");
const path = require("path");
const express = require('express');
var cors = require("cors");
const app = express();
const Server = require("node-git-server");
const port = process.env.PORT || 5005;

app.use(cors());

process.argv.slice(2).forEach(arg => {
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

const repos = new Server(path.normalize(path.resolve(__dirname, "tmp")), {
  autoCreate: true,
  authenticate: (type: string, repo: any, user: any, next: any) => {
    if (type == "push") {
      user((username: any, password: any) => {
        next();
      });
    } else {
      next();
    }
  }
});

app.use('/git', function(req: object, res: object) {
  repos.handle(req, res)
});

app.listen(5005, () => {
  console.log(`Express http server listening`);
});

repos.on("push", (push: any) => {
  push.log(`push ${push.repo} >>> ${push.commit} ( ${push.branch} )`); // eslint-disable-line
  push.accept();
});

repos.on("fetch", (fetch: any) => {
  fetch.log(`username ${fetch.username}`); // eslint-disable-line
  fetch.log(`fetch ${fetch.repo} >>> ${fetch.commit}`); // eslint-disable-line
  fetch.accept();
});


