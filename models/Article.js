const { Schema, model, now } = require("mongoose");

const ArticleSchema = Schema({
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: null
    }
})


module.exports = model('Article', ArticleSchema);