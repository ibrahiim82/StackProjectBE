const mongoose = require("mongoose")

const database = () => {
try {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("mongoDB connected")
    }).catch((err) => {
        console.log(err)
    });
} catch (error) {
    console.log(error)
}
}

module.exports = database