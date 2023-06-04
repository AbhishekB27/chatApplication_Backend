import express from "express";
import { User } from "../services/models/User.js";
import { body, validationResult } from "express-validator";
import { verifyPassword } from "../utils/password.js";
import { createJWT } from "../utils/jwt.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
const router1 = express.Router()

// message object
let message = {
  success: false,
  data: null,
  message: "",
};

//signup route
router1.post(
  "/signUp",
  body("userName").isLength({ min: 5 }).withMessage("userName is too short"),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("confirmPassword") // here we are checking the password by custom validation
    .custom((val, { req }) => {
      if (req.body.password === val) {
        return true;
      }
      return false;
    })
    .withMessage("Password is incorrect"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      message = {
        success: true,
        data: null,
        message: errors.array(),
      };
      return res.status(401).json(message);
    }
    try {
      const { userName, email, password } = req.body;
      const oldUser = await User.findOne({ email: email});
      if (oldUser) {
        message = {
          success: false,
          data: null,
          message: "User already exists",
        };
        res.status(401).send(message);
      }
      const newUser = new User({
        userName,
        email,
        password,
      });
      await newUser.save();
      message = {
        success: true,
        data: newUser,
        message: "User Created 😊",
      };
      return res.json(message);
    } catch (error) {
      message = {
        success: false,
        data: null,
        message: error.message,
      };
      res.json(message);
    }
  }
);

//login route
router1.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      message = {
        success: false,
        data: null,
        message: errors.array(),
      };
      return res.status(401).send(message)
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email:email});
      if (user) {
        const validPassword = verifyPassword(user.password, password);
        if (validPassword) {
          //asign access-token to user
          const token = createJWT({ _id: user._id, email: user.email });
          message = {
            success: true,
            data: { access_Token: token, user: user },
            message: "Welcome! You have successfully Logged In😊",
          };
         return res.send(message);
        } else {
          message = {
            success: false,
            data: null,
            message: "Password Does Not Matched😶",
          };
          return res.status(401).json(message)
        }
      } else {
        message = {
          success: false,
          data: null,
          message: "User does not exist😟",
        };
        return res.status(401).send(message);
      }
    } catch (error) {
      message = {
        success: false,
        data: null,
        message: error.message,
      };
      return res.send(message);
    }
  }
);

// get user profile data by token verification
router1.get("/userProfile", isAuthenticated, async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email: email })
    message = {
      success: true,
      data: user,
      message: "Welcome😊",
    };
    res.send(message);
  } catch (error) {
    message = {
      success: false,
      data: {},
      message: error.message,
    };
    res.status(401).send(message);
  }
});

//update route
router1.put("/update/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let updatedUser = await User.findById(id)
    if(!updatedUser){
      message = {
        success: false,
        data: null,
        message: "User not found",
      };
      return res.send(message);
    }
    updatedUser.set(data)
    updatedUser = await updatedUser.save()
      message = {
        success: true,
        data: updatedUser,
        message: "Successfully updated😊",
      };
      return res.send(message);
  } catch (error) {
    message = {
      success: false,
      data: null,
      message: error.message,
    };
    res.send(message);
  }
});

//get a user by search query
router1.get('/find?',isAuthenticated,async(req,res)=>{
  try {
    const keyword = req.query.search ? {
      $or: [
        {name: {$regex: req.query.search, $options: 'i'}},
        {email: {$regex: req.query.search, $options:'i'}}
      ]
    } : {}
    const users = await User.find(keyword).find({ _id: {$ne: req.user._id}})

    res.send(users)
  } catch (error) {
    
  }
})
export default router1;
