const urlModel = require('../models/urlModel');
const validUrl = require('valid-url')
const shortid = require('shortid')
const redis = require("redis");
const { promisify } = require("util");

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

//Connect to redis
const redisClient = redis.createClient(
    15026,
    "redis-15026.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("S2xrIR7ZHwRKWsaFe7uVK3NHF02Pegox", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const createUrl = async function (req, res) {
    try {
        let url = req.body;
        if (Object.keys(url).length <= 0) {
            return res.status(400).send({ status: false, message: "please provide data in the body" })
        }
        const { longUrl } = url
        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "please provide longUrl in the body" })
        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, message: "Invalid url" })
        }
        let uniqueurl = await urlModel.findOne({ longUrl }).select({ createdAt: 0, updatedAt: 0, _id: 0, __v: 0 })
        if (uniqueurl) {
            return res.status(200).send({ status: false, message: "URL already shorten", data: uniqueurl })
        }
        let urlCode = shortid.generate();
        url.urlCode = urlCode
        const baseUrl = 'http://localhost:3000'
        let shortUrl = baseUrl + '/' + urlCode
        url.shortUrl = shortUrl
        let urldata = await urlModel.create(url)
        let urldetails = await urlModel.findOne({ _id: urldata._id }).select({ createdAt: 0, updatedAt: 0, _id: 0, __v: 0 })
        res.status(201).send({ status: true, message: urldetails })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const getUrl = async function (req, res) {
    try {
        let shortUrl = req.params.urlCode;
        if (!shortUrl) {
            return res.status(400).send({ status: false, message: "Please provide url code" })
        }
        let url = await urlModel.findOne({ urlCode: shortUrl })
        // if (url) {
        //     return res.redirect(url.longUrl)
        // }
        if (!url) {
            return res.status(404).send({ status: false, message: "Please provide correct url code" })
        }
        let cahcedProfileData = await GET_ASYNC(`${req.params.urlCode}`)
        if (cahcedProfileData) {
            res.redirect(url.longUrl)
        } else {
            // let profile = await urlModel.findById(req.params.urlCode);
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(url))
            res.send({ data: url });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl