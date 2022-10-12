const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const connectionString = process.env.ATLAS_URI;

mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once('connected', () => {
    console.log('Database Connected');
})

const articlesSchema = new mongoose.Schema({})
const issuesSchema = new mongoose.Schema({ no: Number})

const Articles = mongoose.model("Articles", articlesSchema, "articles");
const Issues = mongoose.model("Issues", issuesSchema, "issues")


module.exports = { Articles, Issues }
