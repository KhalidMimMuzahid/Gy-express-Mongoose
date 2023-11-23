const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  user_id: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  sponsor_id: { type: String, required: true },
  sponsor_name: { type: String, required: true },
  mobile: {type: String, require: false},
 
  token: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  user_status: { type: Boolean, default: true },
  country: String,
  gender: String,
  avatar_public_url: String,
  avatar: String,
  join_date: { type: String },
  delete_status: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
