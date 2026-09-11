const express = require('express');
const {AllBookingFinderFromResultForOperator,AllBookingFinderFromResultForStudent,statusUpdateByOperator,StatusUpdateByStudent,UpdateVisibility} = require('../Controllers/ResultsController');
const ResultRouter = express.Router();

ResultRouter.get('/findAllBookingForOperator/:userId', AllBookingFinderFromResultForOperator);  
ResultRouter.get('/findAllBookingForStudent/:userId', AllBookingFinderFromResultForStudent);  
ResultRouter.post('/statusUpdateByOperator', statusUpdateByOperator);  
ResultRouter.get('/statusUpdateByStudent/:userId/:resultId', StatusUpdateByStudent);  
ResultRouter.post('/updateResultVisibility', UpdateVisibility);  



module.exports = {ResultRouter};


