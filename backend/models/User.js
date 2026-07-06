const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatarColor: { type: String, default: () => randomColor() },
  },
  { timestamps: true }
);

function randomColor() {
  const palette = ["#5B8DEF", "#F2994A", "#27AE60", "#9B51E0", "#EB5757", "#17A2B8"];
  return palette[Math.floor(Math.random() * palette.length)];
}

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatarColor: this.avatarColor,
  };
};

module.exports = mongoose.model("User", userSchema);
