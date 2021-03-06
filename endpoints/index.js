"use strict";
exports.__esModule = true;
var express = require("express");
var cors = require("cors");
var fetch = require("node-fetch");
var bodyParser = require("body-parser");
var eosjs_1 = require("eosjs");
var eosjs_jssig_1 = require("eosjs/dist/eosjs-jssig");
var eosjs_ecc_1 = require("eosjs-ecc");
var text_encoding_1 = require("text-encoding");
var admin = require("firebase-admin");
var serviceAccount = require("./alpha-c9cce-firebase-adminsdk-8qaw1-db69200023.json");
var fs = require("fs");
var git_processor = require("simple-git/promise");
/***** Express Setup ********/
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
app.set("port", process.env.PORT || 5001);
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}
/***** Firebpse setup ******/
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
var db = admin.firestore();
/***** EOS setup *****/
var nodeos = "http://35.197.95.46:8888";
var accounts = [
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
app.post("/create_account", function (req, res) {
    var account_name = req.body.account_name;
    eosjs_ecc_1.PrivateKey.randomKey().then(function (privateKey) {
        var account = accounts[0].name;
        var privKey = accounts[0].privateKey;
        var privateWif = privateKey.toWif();
        var pubkey = eosjs_ecc_1.PrivateKey.fromString(privateWif)
            .toPublic()
            .toString();
        // eosjs function call: connect to the blockchain
        var rpc = new eosjs_1.JsonRpc(nodeos, { fetch: fetch });
        var sig = new eosjs_jssig_1["default"]([privKey]);
        var api = new eosjs_1.Api({
            rpc: rpc,
            signatureProvider: sig,
            textDecoder: new text_encoding_1.TextDecoder(),
            textEncoder: new text_encoding_1.TextEncoder()
        });
        api
            .transact({
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
        }, {
            blocksBehind: 3,
            expireSeconds: 30
        })
            .then(function (eos_create_acct_result) {
            console.log("EOS_CREATE_ACCOUNT_SUCCESS");
            console.log(eos_create_acct_result);
            var actionData = {
                acct_name: account_name,
                first_name: req.body.first_name,
                last_name: req.body.last_name
            };
            var actionName = "createacct";
            var sig = new eosjs_jssig_1["default"]([privateWif]);
            var api1 = new eosjs_1.Api({
                rpc: rpc,
                signatureProvider: sig,
                textDecoder: new text_encoding_1.TextDecoder(),
                textEncoder: new text_encoding_1.TextEncoder()
            });
            api1
                .transact({
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
            }, {
                blocksBehind: 3,
                expireSeconds: 30
            })
                .then(function (create_acct_result) {
                console.log("DEVELOPX_CREATE_ACCOUNT_SUCCESS");
                console.log(create_acct_result);
                var docRef = db.collection("scatter").doc(account_name);
                docRef.set({
                    Account_Name: account_name,
                    Public_Key: pubkey,
                    Private_Key: privateWif
                }, { merge: true });
                return res.send("DEVELOPX_CREATE_ACCOUNT_SUCCESS");
            })["catch"](function (e) {
                console.error(e);
                console.log("DEVELOPX_CREATE_ACCOUNT_EXCEPTION: " + e);
                if (e instanceof eosjs_1.RpcError) {
                    console.log(JSON.stringify(e.json, null, 2));
                }
            });
        })["catch"](function (e) {
            console.error(e);
            console.log("EOS_CREATE_ACCOUNT_EXCEPTION: " + e);
            if (e instanceof eosjs_1.RpcError) {
                console.log(JSON.stringify(e.json, null, 2));
            }
        });
    });
});
app.post("/create_project", function (req, res) {
    var account_name = req.body.account_name;
    console.log("account name", account_name);
    var scatterRef = db
        .collection("scatter")
        .doc(account_name);
    scatterRef.get().then(function (doc) {
        if (!doc.exists) {
            console.log("No such document!");
        }
        else {
            // define actionName and action according to event type
            var actionName = "createproj";
            console.log("account_name " + account_name);
            var actionData = {
                proj_manager: account_name,
                project_name: req.body.project_name
            };
            // eosjs function call: connect to the blockchain
            var rpc = new eosjs_1.JsonRpc(nodeos, { fetch: fetch });
            var sig = new eosjs_jssig_1["default"]([
                doc._fieldsProto.Private_Key.stringValue
            ]);
            var api = new eosjs_1.Api({
                rpc: rpc,
                signatureProvider: sig,
                textDecoder: new text_encoding_1.TextDecoder(),
                textEncoder: new text_encoding_1.TextEncoder()
            });
            api
                .transact({
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
            }, {
                blocksBehind: 3,
                expireSeconds: 30
            })
                .then(function (create_project_result) {
                console.log(create_project_result);
                return res.send("CREATE_PROJECT_SUCCESS");
            })["catch"](function (e) {
                console.error(e);
                console.log("CREATE_PROJECT_EXCEPTION: " + e);
                if (e instanceof eosjs_1.RpcError) {
                    console.log(JSON.stringify(e.json, null, 2));
                }
            });
        }
    });
});
app.post("/add_contributor", function (req, res) {
    var proj_manager = req.body.proj_manager;
    var scatterRef = db
        .collection("scatter")
        .doc(proj_manager);
    scatterRef.get().then(function (doc) {
        if (!doc.exists) {
            console.log("No such document!");
        }
        else {
            var actionName = "addmanager";
            var actionData = {
                proj_manager: proj_manager,
                project_name: req.body.project_name,
                new_manager: req.body.new_manager
            };
            var rpc = new eosjs_1.JsonRpc(nodeos, { fetch: fetch });
            var sig = new eosjs_jssig_1["default"]([
                doc._fieldsProto.Private_Key.stringValue
            ]);
            var api = new eosjs_1.Api({
                rpc: rpc,
                signatureProvider: sig,
                textDecoder: new text_encoding_1.TextDecoder(),
                textEncoder: new text_encoding_1.TextEncoder()
            });
            api
                .transact({
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
            }, {
                blocksBehind: 3,
                expireSeconds: 30
            })
                .then(function (add_contributor_result) {
                console.log(add_contributor_result);
                return res.send("ADD_CONTRIBUTOR_SUCCESS");
            })["catch"](function (e) {
                console.log(e);
                console.log("ADD_CONTRIBUTOR_EXCEPTION: " + e);
                if (e instanceof eosjs_1.RpcError) {
                    console.log(JSON.stringify(e.json, null, 2));
                }
            });
        }
    });
});
app.post("/delete_contributor", function (req, res) {
    var proj_manager = req.body.proj_manager;
    var scatterRef = db
        .collection("scatter")
        .doc(proj_manager);
    scatterRef.get().then(function (doc) {
        if (!doc.exists) {
            console.log("No such document!");
        }
        else {
            var actionName = "delmanager";
            var actionData = {
                proj_manager: proj_manager,
                project_name: req.body.project_name,
                del_manager: req.body.del_manager
            };
            var rpc = new eosjs_1.JsonRpc(nodeos, { fetch: fetch });
            var sig = new eosjs_jssig_1["default"]([
                doc._fieldsProto.Private_Key.stringValue
            ]);
            var api = new eosjs_1.Api({
                rpc: rpc,
                signatureProvider: sig,
                textDecoder: new text_encoding_1.TextDecoder(),
                textEncoder: new text_encoding_1.TextEncoder()
            });
            api
                .transact({
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
            }, {
                blocksBehind: 3,
                expireSeconds: 30
            })
                .then(function (delete_contributor_result) {
                console.log(delete_contributor_result);
                return res.send("DELETE_CONTRIBUTOR_SUCCESS");
            })["catch"](function (e) {
                console.log(e);
                console.log("DELETE_CONTRIBUTOR_EXCEPTION: " + e);
                if (e instanceof eosjs_1.RpcError) {
                    console.log(JSON.stringify(e.json, null, 2));
                }
            });
        }
    });
});
/*********** Getter Endpoints *****/
app.post("/get_all_projects", function (req, res) {
    var rpc = new eosjs_1.JsonRpc(nodeos, { fetch: fetch });
    rpc
        .get_table_rows({
        json: true,
        code: "devxcontract",
        scope: "devxcontract",
        table: "projects",
        lower_bound: 0,
        limit: 200
    })
        .then(function (projects) {
        console.log(projects);
        return res.send(projects.rows);
    })["catch"](function (e) {
        console.error(e);
        console.log("GET_ALL_PROJECTS_EXCEPTION: " + e);
        if (e instanceof eosjs_1.RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
    });
});
app.post("/get_profile_data", function (req, res) {
    var account_name = req.body.account_name;
    console.log("test account name", account_name);
    var rpc = new eosjs_1.JsonRpc(nodeos, { fetch: fetch });
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
        .then(function (accounts) {
        console.log(accounts.rows[0]);
        return res.send(accounts.rows[0]);
    })["catch"](function (e) {
        console.error(e);
        console.log("GET_PROFILE_DATA_EXCEPTION: " + e);
        if (e instanceof eosjs_1.RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
    });
});
app.post("/get_project_by_id", function (req, res) {
    var project_id = req.body.project_id;
    var rpc = new eosjs_1.JsonRpc(nodeos, { fetch: fetch });
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
        .then(function (project) {
        console.log(project.rows[0]);
        return res.send(project.rows[0]);
    })["catch"](function (e) {
        console.error(e);
        console.log("GET_PROJECT_BY_ID_ECEPTION: " + e);
        if (e instanceof eosjs_1.RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
    });
});
app.post("/get_project_by_name", function (req, res) {
    var project_name = req.body.project_name;
    var rpc = new eosjs_1.JsonRpc(nodeos, { fetch: fetch });
    rpc.get_table_rows({
        "json": true,
        "code": "devxcontract",
        "scope": "devxcontract",
        "table": "projects",
        "lower_bound": 0,
        "limit": 200
    }).then(function (projects) {
        var repo = "project " + project_name + " does not exists";
        for (var i = 0; i < projects.rows.length; i++) {
            if (projects.rows[i].project_name === project_name) {
                repo = projects.rows[i];
            }
        }
        res.send(repo);
    })["catch"](function (e) {
        console.error(e);
        console.log('GET_PROJECT_BY_NAME EXCEPTION: ' + e);
        if (e instanceof eosjs_1.RpcError) {
            console.log(JSON.stringify(e.json, null, 2));
        }
    });
});
/***** Git Endpoints *****/
/*********** Setter Endpoints *****/
app.post("/repository_exists", function (req, res) {
    var repositoryPath = "/" + req.body.proj_manager + "/" + req.body.project_name + ".git";
    var bool = fs.existsSync("../gitServer/tmp/" + repositoryPath);
    console.log({ repoExists: { repositoryPath: repositoryPath, exists: bool } });
    return res.send(bool);
});
app.post("/get_last_commit", function (req, res) {
    var filePath = "." + req.body.file_path;
    var repositoryPath = req.body.proj_manager + "/" + req.body.project_name + ".git";
    var git = git_processor("../gitServer/tmp/" + repositoryPath);
    console.log("im here");
    git
        .log([["--"], filePath])
        .then(function (commits) {
        console.log(commits.latest);
        return res.send(commits.latest);
    })["catch"](function (e) {
        console.error(e);
        console.log("GET_LAST_COMMIT_EXCEPTION: " + e);
    });
});
app.post("/get_total_commits", function (req, res) {
    var repositoryPath = "/" + req.body.proj_manager + "/" + req.body.project_name + ".git";
    var git = git_processor("../gitServer/tmp/" + repositoryPath);
    git
        .log()
        .then(function (commits) {
        var result = {
            total_commits: commits.total
        };
        console.log(result);
        return res.send(result);
    })["catch"](function (e) {
        console.error(e);
        console.log("GET_TOTAL_COMMITS_EXCEPTION: " + e);
    });
});
app.post("/get_tree_content", function (req, res) {
    var directory = req.body.directory;
    var repositoryPath = "/" + req.body.proj_manager + "/" + req.body.project_name + ".git";
    var git = git_processor("../gitServer/tmp/" + repositoryPath);
    git
        .catFile(["-p", directory + "^{tree}"])
        .then(function (dir) {
        var splitLine = dir.split("\n");
        splitLine.pop();
        var result = [];
        for (var i = 0; i < splitLine.length; i++) {
            var row = splitLine[i].split(" ");
            var hash = row[2].split("\t");
            row[2] = hash[0];
            row[3] = hash[1];
            result[splitLine.length - (i + 1)] = row;
        }
        console.log({ getTreeContent: result });
        return res.send(result);
    })["catch"](function (e) {
        console.error(e);
        console.log("GET_TREE_CONTENT_EXCEPTION: " + e);
    });
});
app.post("/get_file", function (req, res) {
    var repositoryPath = "/" + req.body.proj_manager + "/" + req.body.project_name + ".git";
    var blob = req.body.blob;
    var git = git_processor("../gitServer/tmp/" + repositoryPath);
    git
        .catFile(["-p", blob])
        .then(function (code) {
        console.log({ getFile: code });
        return res.send(code);
    })["catch"](function (e) {
        console.error(e);
        console.log("GET_FILE_EXCEPTION: " + e);
    });
});
app.listen(app.get("port"), function () {
    console.log("Find the DevelopX API at: http://localhost:" + app.get("port") + "/");
});
