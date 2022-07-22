const express = require("express");
const router = express.Router();
const urlController = require("../controller/urlController")

router.post("/url/shorten", urlController.createUrl)

router.get("/:urlCode",urlController.getUrl)


router.all('/*', async function(req, res){
    res.status(404).send({status: false, msg: "Page Not Found!!!"})
})
module.exports = router