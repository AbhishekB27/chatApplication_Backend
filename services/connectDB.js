import mongoose from "mongoose";
const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => console.log("Mongoose Connected Successfully"))
    .catch((err) => console.log("Error: " + err));
};
export default connectDB;