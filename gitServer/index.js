// You Can Use The Commands Below To Generate A Self Signed Certificate For Use With This Tutorial
// These Commands Require That You have 'openssl' installed on your system
// openssl genrsa -out privatekey.pem 1024
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem

let type = "http";
const fs = require("fs");
const path = require("path");
const Server = require("node-git-server");
const port = process.env.PORT || 5005;



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
  authenticate: (type, repo, user, next) => {
    if (type == "push") {
      user((username, password) => {
        next();
      });
    } else {
      next();
    }
  }
});

repos.on("push", push => {
  console.log(`push ${push.repo} / ${push.commit} ( ${push.branch} )`); // eslint-disable-line
  console.log("push func");
  //console.log(push);
  //console.log(push.headers["authorization"][2]);
  push.accept();
});

repos.on("fetch", fetch => {
  console.log(`username ${fetch.username}`); // eslint-disable-line
  console.log(`fetch ${fetch.repo}/${fetch.commit}`); // eslint-disable-line
  console.log();
  console.log(repos);
  console.log();
  fetch.accept();
});

repos.listen(
  port,
  {
    type,
    key: fs.readFileSync(path.resolve(__dirname, "privatekey.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "certificate.pem"))
  },
  error => {
    if (error)
      return console.error(
        `failed to start DevelopX-server because of error ${error}`
      ); // eslint-disable-line
    console.log(`DevelopX-server running at ${type}://localhost:${port}`); // eslint-disable-line
    repos.list((err, result) => {
      if (!result) {
        console.log("No repositories available..."); // eslint-disable-line
      } else {
        console.log(result); // eslint-disable-line
      }
    });
  }
);
