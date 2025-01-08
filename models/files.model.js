const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  originalname: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const fileModel = mongoose.model("File", fileSchema);

module.exports = fileModel;
