import mongoose from "mongoose";
import { hashedPassword } from "../../utils/password.js";

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    pic:{
        type: String,
        default: 'https://st4.depositphotos.com/4329009/19956/v/600/depositphotos_199564354-stock-illustration-creative-vector-illustration-default-avatar.jpg'
    }
},{timestamps: true})

userSchema.pre("save", async function (next) {
    try {
      const { password } = this;
      if (password) {
        this.password = await hashedPassword(password);
        next();
      } else {
        throw new Error("Failed to hashed Password");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  });
export const User = mongoose.model('User',userSchema)