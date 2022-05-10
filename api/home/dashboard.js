const { Router } = require("express");
const api = Router();

api.get("*", (req, res) =>
  // haha nerds.
  res.redirect("https://coom.hu/")
);

module.exports = api;
