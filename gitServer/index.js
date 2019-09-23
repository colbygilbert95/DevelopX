// You Can Use The Commands Below To Generate A Self Signed Certificate For Use With This Tutorial
// These Commands Require That You have 'openssl' installed on your system
// openssl genrsa -out privatekey.pem 1024
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem

let type = "http";
const fs = require("fs");
const path = require("path");
const Server = require("node-git-server");
const { Api, JsonRpc, RpcError } = require("eosjs");
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { TextDecoder, TextEncoder } = require("text-encoding");
const fetch = require('node-fetch');
const endpoint = "http://35.197.95.46:8888";
const port = process.env.PORT || 5005;

const admin = require("firebase-admin");
const serviceAccount = require("../endpoints/alpha-c9cce-firebase-adminsdk-8qaw1-db69200023.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  authDomain: "alpha-c9cce.firebaseapp.com"
});
const db = admin.firestore();

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
        let scatterRef = db.collection("scatter").doc(username);

        scatterRef
          .get()
          .then(doc => {
            if (!doc.exists) {
              console.log("docuement does not exist");
              next("You must be a DevelopX user to push to this repository");
            } else {
              admin
                .auth()
                .getUser(doc._fieldsProto.uid.stringValue)
                .then(function(userRecord) {
                  // See the UserRecord reference doc for the contents of userRecord.
                  if (!(userRecord.providerData[0].providerId === password)) {
                    next("DevelopX login credentials failed.");
                  } else {
                    
                    const project = repo.split("/")[1];
                    const actionName = "push";
                    const actionData = {
                      contributor: username,
                      project_name: project
                    };
                    const rpc = new JsonRpc(endpoint, { fetch });

                    const sig = new JsSignatureProvider([
                      doc._fieldsProto.Private_Key.stringValue
                    ]);
                    const api = new Api({
                      rpc,
                      signatureProvider: sig,
                      textDecoder: new TextDecoder(),
                      textEncoder: new TextEncoder()
                    });

                    api
                      .transact(
                        {
                          actions: [
                            {
                              account: "devxcontract",
                              name: actionName,
                              authorization: [
                                {
                                  actor: username,
                                  permission: "active"
                                }
                              ],
                              data: actionData
                            }
                          ]
                        },
                        {
                          blocksBehind: 3,
                          expireSeconds: 30
                        }
                      )
                      .then(result => {
                        console.log(result);
                        next();
                      })
                      .catch(function(e) {
                        console.error(e);
                        console.log("Caught exception: " + e);
                        if (e instanceof RpcError) {
                          console.log(JSON.stringify(e.json, null, 2));
                        }
                      });
                  }
                })
                .catch(function(error) {
                  console.log("Error fetching user data:", error);
                  next("The username you provided does not exist");
                });
            }
          })
          .catch(err => {
            console.log("Error getting document", err);
          });
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
