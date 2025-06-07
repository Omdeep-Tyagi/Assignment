const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {//middleware — it runs just before saving a user to the database.
  if (!this.isModified("password")) return next();//event bcrypt from re-hashing an already-hashed password unnecessarily
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password //custom method on the User model.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
