const { Router } = require("express");
const api = Router();

api.get("*", (req, res) => res.send("hege"));

module.exports = api;
