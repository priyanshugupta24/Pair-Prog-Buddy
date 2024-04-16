const express = require('express');
const router = express.Router();

var { fetchReccomendation } = require("../controller/reccomendationController.js");

router.route("/fetchReccomendation").post(fetchReccomendation);

module.exports = router;