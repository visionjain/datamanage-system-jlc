import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userid: {
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
    enum: ["admin", "user"], // Enum restricts the role field to only 'admin' or 'user'
    default: "user", // Default role is 'user' if not specified
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
