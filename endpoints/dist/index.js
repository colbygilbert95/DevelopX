"use strict";
exports.__esModule = true;
var express = require("express");
var app = express();
app.set("port", process.env.PORT || 5001);
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}
app.post("helloworld", function (req, res) {
    res.send("Hello World");
});
