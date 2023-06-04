import express, { response } from 'express';
import { Chat } from '../services/models/Chat.js'
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { User } from '../services/models/User.js';
const router2 = express.Router();
router2.post('/',isAuthenticated, async(req,res) => { 
    const { userId } = req.body;

     // Check if userId is provided
    if (!userId) {
      console.log('Error');
      return res.sendStatus(400);
    }

     // Find an existing chat between the logged-in user and the specified userId
    const existingChat = await Chat.find({
      isGroupChat: false,
      $and: [
        {users: { $elemMatch: {$eq: req.user._id}}},
        {users: { $elemMatch: {$eq: userId}}}
      ]
    })
      .populate('users', '-password')
      .populate('latestMessage')
      .populate({ path: 'latestMessage.sender', select: 'name pic email' });

    // If an existing chat is found, send it in the response
    if (existingChat.length > 0) {
      return res.send(existingChat[0]);
    }
    // Create a new chat and send the full chat details in the response
    try {
    // If no existing chat is found, create a new chat
    const chatData = {
        chatName: 'sender',
        isGroupChat: false, 
        users: [req.user._id, userId]
      };  
      const newChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({_id: newChat._id}).populate('users','-password');
      return res.send(fullChat)
    } catch (error) {
      console.error('Error creating chat:', error);
      res.sendStatus(500);
    }
 })
router2.get('/',isAuthenticated, async(req,res) => { 
    try {
        const chat = await Chat.find({users:{$elemMatch:{$eq: req.user._id}}})
        .populate('users','-password')
        .populate('groupAdmin','-password')
        .populate('latestMessage')
        .sort({updatedAt: -1})
        .populate({ path: 'latestMessage.sender', select: 'name pic email' })
        res.send(chat)
    } catch (error) {
        console.log(error);
    }
 })
router2.post('/createGroup',isAuthenticated,async (req,res) => { 
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message:'Please fill all the fields'})
    }
    let users = req.body.users
    if(users.length < 2){
        return res.status(400).send({message:'More than two users required for group chat'})
    }
    users.push(req.user._id)
    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id
        })
        const fullGroupChat = await Chat.findOne({_id: groupChat._id})
        .populate('users','-password')
        .populate('groupAdmin','-password');
        return res.send(fullGroupChat)
    } catch (error) {
        
    }
 })
router2.put('/renameGroup',isAuthenticated, async (req,res) => { 
    try {
        const {chatId, chatName} = req.body
    const updatedChat = await Chat.findByIdAndUpdate(chatId,{chatName},{new:true})
    .populate('users','-password')
    .populate('groupAdmin','-password')
    
    if(!updatedChat){
       return res.status(404)
    }else{
        return res.send(updatedChat)
    }
    } catch (error) {
        console.log(error)
        return res.status(404)
    }
 })
 router2.put('/addedToGroup',isAuthenticated, async(req,res) => { 
    try {
        const {chatId, userId} = req.body
        const added = await Chat.findByIdAndUpdate(chatId,{
            $push: {users: userId}
        },{new: true}).populate('users','-password')
        .populate('groupAdmin','-password')
        if(!added){
            return res.status(404)
        }else{
            return res.send(added)
        }
    } catch (error) {
        console.log(error)
        return res.status(404)
    }
  })
router2.put('/removedFromGroup',isAuthenticated, async(req,res) => { 
    try {
        const {chatId, userId} = req.body
        const removed = await Chat.findByIdAndUpdate(chatId,{
            $pull: {users: userId}
        },{new: true}).populate('users','-password')
        .populate('groupAdmin','-password')
        if(!removed){
            return res.status(404)
        }else{
            return res.send(removed)
        }
    } catch (error) {
        console.log(error)
        return res.status(404)
    }
  })

export default router2