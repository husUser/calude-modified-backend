const express = require('express');
const {getAllNotification,postNotification,deleteNotification} = require('../Controllers/NotificationsController');
const {authenticateToken} = require('../Auth/Auth')
const Notification = express.Router();

Notification.post('/postNotification',authenticateToken, postNotification);  
Notification.get('/getAllNotifications',authenticateToken, getAllNotification);  
Notification.delete('/deleteNotification/:notificationId',authenticateToken, deleteNotification);  



module.exports = {Notification};


