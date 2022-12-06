const dotenv = require("dotenv").config();
const { ObjectID } = require("bson");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const connectionString = process.env.ATLAS_URI;

mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once("connected", () => {
  console.log("Database Connected");
});

const articlesSchema = new mongoose.Schema(
  {
    categories: String,
    title: String,
    text: String,
    author: { type: mongoose.Types.ObjectId, ref: "Members" },
    date: Date,
    image: String,
    publish: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true }
);
const issuesSchema = new mongoose.Schema({
  no: Number,
  articleIds: [{ type: mongoose.Types.ObjectId }],
  letters: Object,
  publish: { type: Boolean, default: false },
});
const eicsSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const memberSchema = new mongoose.Schema({
  _id: ObjectId,
  name: String,
  position: Array,
  image: String,
  signature: String,
  articles: Array,
  year: Number,
  track: String,
  bio: String,
});

const Articles = mongoose.model("Articles", articlesSchema, "articles");
const Issues = mongoose.model("Issues", issuesSchema, "issues");
const Eics = mongoose.model("Eics", eicsSchema, "eics");
const Members = mongoose.model("Members", memberSchema, "members");

module.exports = { Articles, Issues, Eics, Members };
