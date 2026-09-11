const express = require("express");
// const {userCreateRouter} = require('./Routers/UserR.js')
const {BookingRouter} =require('./Routers/BookingRoute.js')
const {EquipmentRoute} =require('./Routers/EquipmentRoute.js')
const {userRoute} =require('./Routers/UserRoute.js')
const {ProfessorsRoute} =require('./Routers/ProfessorsRoute.js')
const {BlockingRouter} =require('./Routers/BlockingRoute.js')
const {ResultRouter} =require('./Routers/ResultsRoute.js')
const {ClearanceRouter} =require('./Routers/ClearanceRoute.js')
const {Notification} = require ('./Routers/Notification.js')

// const {fileUploader}=require('./Routers/fileUploader.js')
const AllRouters = express.Router();

// AllRouters.use('/admin',userCreateRouter)
AllRouters.use('/user',userRoute)
AllRouters.use('/booking',BookingRouter)
AllRouters.use('/equipments',EquipmentRoute)
AllRouters.use('/professors',ProfessorsRoute)
AllRouters.use('/blocking',BlockingRouter)
AllRouters.use('/result',ResultRouter)
AllRouters.use('/clear',ClearanceRouter)
AllRouters.use('/notification',Notification)
// AllRouters.use('/files',fileUploader)

module.exports={AllRouters} 