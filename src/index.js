const express = require("express");
const bodyParser = require("body-parser");
const {default: mongoose} = require("mongoose");
const route = require("../src/routes/routes");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://urlShortner:YEJsATs3xmNKbsi3@cluster0.1gmi2hm.mongodb.net/group28Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});