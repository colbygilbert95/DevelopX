const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
import { Api, JsonRpc, RpcError }from "eosjs";
import * as Eos from "eosjs";
import JsSignatureProvider from "eosjs/dist/eosjs-jssig";
const ecc = require('eosjs-ecc');
const PrivateKey = ecc.PrivateKey;
import { TextDecoder, TextEncoder } from "text-encoding";
const admin = require("firebase-admin");
const serviceAccount = require("./alpha-c9cce-firebase-adminsdk-8qaw1-db69200023.json");
const fs = require("fs");
const git_processor = require("simple-git/promise");
import BigNumber from "bignumber.js"

/***** Express Setup ********/
const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());
app.set("port", process.env.PORT || 5001);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

/***** Firebpse setup ******/
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

/***** EOS setup *****/
const nodeos = "http://35.197.95.46:8888";

const accounts = [
  {
    name: "useraaaaaaaa",
    privateKey: "5K7mtrinTFrVTduSxizUc5hjXJEtTjVTsqSHeBHes1Viep86FP5",
    publicKey: "EOS6kYgMTCh1iqpq9XGNQbEi8Q6k5GujefN9DSs55dcjVyFAq7B6b"
  },
  {
    name: "useraaaaaaab",
    privateKey: "5KLqT1UFxVnKRWkjvhFur4sECrPhciuUqsYRihc1p9rxhXQMZBg",
    publicKey: "EOS78RuuHNgtmDv9jwAzhxZ9LmC6F295snyQ9eUDQ5YtVHJ1udE6p"
  },
  {
    name: "useraaaaaaac",
    privateKey: "5K2jun7wohStgiCDSDYjk3eteRH1KaxUQsZTEmTGPH4GS9vVFb7",
    publicKey: "EOS5yd9aufDv7MqMquGcQdD6Bfmv6umqSuh9ru3kheDBqbi6vtJ58"
  },
  {
    name: "useraaaaaaad",
    privateKey: "5KNm1BgaopP9n5NqJDo9rbr49zJFWJTMJheLoLM5b7gjdhqAwCx",
    publicKey: "EOS8LoJJUU3dhiFyJ5HmsMiAuNLGc6HMkxF4Etx6pxLRG7FU89x6X"
  },
  {
    name: "useraaaaaaae",
    privateKey: "5KE2UNPCZX5QepKcLpLXVCLdAw7dBfJFJnuCHhXUf61hPRMtUZg",
    publicKey: "EOS7XPiPuL3jbgpfS3FFmjtXK62Th9n2WZdvJb6XLygAghfx1W7Nb"
  },
  {
    name: "useraaaaaaaf",
    privateKey: "5KaqYiQzKsXXXxVvrG8Q3ECZdQAj2hNcvCgGEubRvvq7CU3LySK",
    publicKey: "EOS5btzHW33f9zbhkwjJTYsoyRzXUNstx1Da9X2nTzk8BQztxoP3H"
  },
  {
    name: "useraaaaaaag",
    privateKey: "5KFyaxQW8L6uXFB6wSgC44EsAbzC7ideyhhQ68tiYfdKQp69xKo",
    publicKey: "EOS8Du668rSVDE3KkmhwKkmAyxdBd73B51FKE7SjkKe5YERBULMrw"
  }
];

/***** Nodeos Endpoints *****/
/*********** Setter Endpoints *****/

app.post("/create_account", (req: any, res: any) => {
  let account_name: string = req.body.account_name;
  PrivateKey.randomKey().then((privateKey: any) => {
    let account: string = accounts[0].name;
    let privKey: string = accounts[0].privateKey;

    let privateWif: string = privateKey.toWif();
    let pubkey: string = PrivateKey.fromString(privateWif)
      .toPublic()
      .toString();

    // eosjs function call: connect to the blockchain
    const rpc: JsonRpc = new JsonRpc(nodeos, { fetch });
    const sig: JsSignatureProvider = new JsSignatureProvider([privKey]);
    const api: Api = new Api({
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
              account: "eosio",
              name: "newaccount",
              authorization: [
                {
                  actor: account,
                  permission: "active"
                }
              ],
              data: {
                creator: account,
                name: account_name,
                owner: {
                  threshold: 1,
                  keys: [
                    {
                      key: pubkey,
                      weight: 1
                    }
                  ],
                  accounts: [],
                  waits: []
                },
                active: {
                  threshold: 1,
                  keys: [
                    {
                      key: pubkey,
                      weight: 1
                    }
                  ],
                  accounts: [],
                  waits: []
                }
              }
            }
          ]
        },
        {
          blocksBehind: 3,
          expireSeconds: 30
        }
      )
      .then((eos_create_acct_result: any) => {
        console.log("EOS_CREATE_ACCOUNT_SUCCESS");
        console.log(eos_create_acct_result);

        let actionData = {
          acct_name: account_name,
          first_name: req.body.first_name,
          last_name: req.body.last_name
        };
        let actionName: string = "createacct";
        const sig: JsSignatureProvider = new JsSignatureProvider([privateWif]);
        const api1: Api = new Api({
          rpc,
          signatureProvider: sig,
          textDecoder: new TextDecoder(),
          textEncoder: new TextEncoder()
        });
        api1
          .transact(
            {
              actions: [
                {
                  account: "devxcontract",
                  name: actionName,
                  authorization: [
                    {
                      actor: account_name,
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
          .then((create_acct_result: any) => {
            console.log("DEVELOPX_CREATE_ACCOUNT_SUCCESS");
            console.log(create_acct_result);
            let docRef = db.collection("scatter").doc(account_name);

            docRef.set(
              {
                Account_Name: account_name,
                Public_Key: pubkey,
                Private_Key: privateWif
              },
              { merge: true }
            );
            return res.send("DEVELOPX_CREATE_ACCOUNT_SUCCESS");
          })
          .catch((e: any) => {
            console.error(e);
            console.log("DEVELOPX_CREATE_ACCOUNT_EXCEPTION: " + e);
            if (e instanceof RpcError) {
              console.log(JSON.stringify(e.json, null, 2));
            }
          });
      })
      .catch((e: any) => {
        console.error(e);
        console.log("EOS_CREATE_ACCOUNT_EXCEPTION: " + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json,null, 2));
        }
      });
  });
});

app.post("/create_project", (req: any, res: any) => {
  let account_name: string = req.body.account_name;
  console.log("account name", account_name);
  let scatterRef: any = db
    .collection("scatter")
    .doc(account_name);
  scatterRef.get().then((doc: any) => {
    if (!doc.exists) {
      console.log("No such document!");
    } else {
      // define actionName and action according to event type
      let actionName = "createproj";
      console.log("account_name " + account_name);
      let actionData = {
        proj_manager: account_name,
        project_name: req.body.project_name
      };
      // eosjs function call: connect to the blockchain
      const rpc: JsonRpc = new JsonRpc(nodeos, { fetch });

      const sig: JsSignatureProvider = new JsSignatureProvider([
        doc._fieldsProto.Private_Key.stringValue
      ]);
      const api: Api = new Api({
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
                    actor: account_name,
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
        .then((create_project_result: any) => {
          console.log(create_project_result);
          return res.send("CREATE_PROJECT_SUCCESS");
        })
        .catch((e: any) => {
          console.error(e);
          console.log("CREATE_PROJECT_EXCEPTION: " + e);
          if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
          }
        });
    }
  });
});

app.post("/add_contributor", (req: any, res: any) => {
  let proj_manager: string = req.body.proj_manager;
  let scatterRef: any = db
    .collection("scatter")
    .doc(proj_manager);
  scatterRef.get().then((doc: any) => {
    if (!doc.exists) {
      console.log("No such document!");
    } else {
      let actionName: string = "addmanager";
      let actionData = {
        proj_manager: proj_manager,
        project_name: req.body.project_name,
        new_manager: req.body.new_manager
      };

      const rpc: JsonRpc = new JsonRpc(nodeos, { fetch });

      const sig: JsSignatureProvider = new JsSignatureProvider([
        doc._fieldsProto.Private_Key.stringValue
      ]);
      const api: Api = new Api({
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
                    actor: proj_manager,
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
        .then((add_contributor_result: any) => {
          console.log(add_contributor_result);
          return res.send("ADD_CONTRIBUTOR_SUCCESS");
        })
        .catch((e: any) => {
          console.log(e);
          console.log("ADD_CONTRIBUTOR_EXCEPTION: " + e);
          if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
          }
        });
    }
  });
});

app.post("/delete_contributor", (req: any, res: any) => {
  let proj_manager: string = req.body.proj_manager;
  let scatterRef: any = db
    .collection("scatter")
    .doc(proj_manager);

  scatterRef.get().then((doc: any) => {
    if (!doc.exists) {
      console.log("No such document!");
    } else {
      let actionName: string = "delmanager";
      let actionData = {
        proj_manager: proj_manager,
        project_name: req.body.project_name,
        del_manager: req.body.del_manager
      };

      const rpc: JsonRpc = new JsonRpc(nodeos, { fetch });

      const sig: JsSignatureProvider = new JsSignatureProvider([
        doc._fieldsProto.Private_Key.stringValue
      ]);
      const api: Api = new Api({
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
                    actor: proj_manager,
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
        .then((delete_contributor_result: any) => {
          console.log(delete_contributor_result);
          return res.send("DELETE_CONTRIBUTOR_SUCCESS");
        })
        .catch((e: any) => {
          console.log(e);
          console.log("DELETE_CONTRIBUTOR_EXCEPTION: " + e);
          if (e instanceof RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
          }
        });
    }
  });
});

/*********** Getter Endpoints *****/

app.post("/get_all_projects", (req: any, res: any) => {
  const rpc: any = new JsonRpc(nodeos, { fetch });

  rpc
    .get_table_rows({
      json: true,
      code: "devxcontract", // account who owns contract
      scope: "devxcontract", // scope of the contract
      table: "projects", // name of the table as specified by the contract abi
      lower_bound: 0,
      limit: 200
    })
    .then((projects: any) => {
      console.log(projects);

      return res.send(projects.rows);
    })
    .catch((e: any) => {
      console.error(e);
      console.log("GET_ALL_PROJECTS_EXCEPTION: " + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

app.post("/get_profile_data", (req: any, res: any) => {
  let account_name:string = req.body.account_name;
  console.log("test account name", account_name);

  const rpc = new JsonRpc(nodeos, { fetch });

  rpc
    .get_table_rows({
      json: true,
      code: "devxcontract",
      scope: "devxcontract",
      table: "accounts",
      table_key: account_name,
      index_postion: "primary",
      lower_bound: account_name,
      key_type: "name"
    })
    .then((accounts: any) => {
      console.log(accounts.rows[0]);
      return res.send(accounts.rows[0]);
    })
    .catch((e: any) => {
      console.error(e);
      console.log("GET_PROFILE_DATA_EXCEPTION: " + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

app.post("/get_project_by_id", (req: any, res: any) => {
  let project_id:string = req.body.project_id;
  
  const rpc = new JsonRpc(nodeos, { fetch });
  rpc
    .get_table_rows({
      json: true,
      code: "devxcontract",
      scope: "devxcontract",
      table: "projects",
      table_key: project_id,
      lower_bound: project_id,
      index_postion: "primary",
      key_type: "uint64_t"
    })
    .then((project: any) => {
      console.log(project.rows[0]);
      return res.send(project.rows[0]);
    })
    .catch((e: any) => {
      console.error(e);
      console.log("GET_PROJECT_BY_ID_ECEPTION: " + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

app.post("/get_project_by_name", (req: any, res: any) => {
    let project_name:string = req.body.project_name;

    const rpc = new JsonRpc(nodeos, { fetch });
    rpc.get_table_rows({
      "json": true,
      "code": "devxcontract",   
      "scope": "devxcontract",  
      "table": "projects",        
      "lower_bound": 0,        
      "limit": 200,
    }).then((projects:any) => {
      let repo:any = "project " + project_name + " does not exists";
      
      for (let i:number = 0; i < projects.rows.length; i++) {
        if (projects.rows[i].project_name === project_name) {
          repo = projects.rows[i];
        }
      }


      res.send(
        repo
      );
    }).catch((e:any) => {
      console.error(e);
      console.log('GET_PROJECT_BY_NAME EXCEPTION: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });  
});

/***** Git Endpoints *****/
/*********** Getter Endpoints *****/
app.post("/repository_exists", (req: any, res: any) => {
  const repositoryPath: string = 
    "/" + req.body.proj_manager + "/" + req.body.project_name + ".git";

  const bool: boolean = fs.existsSync("../gitServer/tmp/" + repositoryPath);
  console.log({ repoExists: { repositoryPath: repositoryPath, exists: bool } });
  return res.send(bool);
});

app.post("/get_last_commit", (req: any, res: any) => {
  const filePath: string = "." + req.body.file_path;
  const repositoryPath: string = 
    req.body.proj_manager + "/" + req.body.project_name + ".git";
 
  const git: any = git_processor("../gitServer/tmp/" + repositoryPath);
  console.log("im here");
  git
    .log([["--"], filePath])
    .then((commits: any) => {
      console.log(commits.latest);
      return res.send(commits.latest);
    })
    .catch((e: any) => {
      console.error(e);
      console.log("GET_LAST_COMMIT_EXCEPTION: " + e);
    });
});
app.post("/get_total_commits", (req: any, res: any) => {
  const repositoryPath: string = 
    "/" + req.body.proj_manager + "/" + req.body.project_name + ".git";
    
  const git: any = git_processor("../gitServer/tmp/" + repositoryPath);
  git
    .log()
    .then((commits: any) => {
      const result = {
        total_commits: commits.total
      };
      console.log(result);
      return res.send(result);
    })
    .catch((e: any) => {
      console.error(e);
      console.log("GET_TOTAL_COMMITS_EXCEPTION: " + e);
    });
});

app.post("/get_tree_content", (req: any, res: any) => {
  const directory: string = req.body.directory;
  const repositoryPath: string = 
    "/" + req.body.proj_manager + "/" + req.body.project_name + ".git";

    
  const git: any = git_processor("../gitServer/tmp/" + repositoryPath);

  git
    .catFile(["-p", directory + "^{tree}"])
    .then((dir: any) => {
      let splitLine: string[] = dir.split("\n");
      splitLine.pop();

      let result: string[][] = [];
      for (let i: number = 0; i < splitLine.length; i++) {
        let row: string[] = splitLine[i].split(" ");
        let hash: string[] = row[2].split("\t");
        row[2] = hash[0];
        row[3] = hash[1];
        result[splitLine.length - (i + 1)] = row;
      }

      console.log({ getTreeContent: result });
      return res.send(result);
    })
    .catch((e: any) => {
      console.error(e);
      console.log("GET_TREE_CONTENT_EXCEPTION: " + e);
    });
});

app.post("/get_file", (req: any, res: any) => {
  const repositoryPath: string = 
    "/" + req.body.proj_manager + "/" + req.body.project_name + ".git";
  const blob: string = req.body.blob;

  const git: any = git_processor("../gitServer/tmp/" + repositoryPath);
  git
    .catFile(["-p", blob])
    .then((code: any) => {
      console.log({ getFile: code });
      return res.send(code);
    })
    .catch((e: any) => {
      console.error(e);
      console.log("GET_FILE_EXCEPTION: " + e);
    });
});

app.listen(app.get("port"), () => {
  console.log(`Find the DevelopX API at: http://localhost:${app.get("port")}/`);
});
