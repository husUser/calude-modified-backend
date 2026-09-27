const express = require('express');
const {AllBookingFinderFromResultForOperator,AllBookingFinderFromResultForStudent,statusUpdateByOperator,StatusUpdateByStudent,UpdateVisibility,cancelBookingByStudent} = require('../Controllers/ResultsController');
const ResultRouter = express.Router();

ResultRouter.get('/findAllBookingForOperator/:userId', AllBookingFinderFromResultForOperator);  
ResultRouter.get('/findAllBookingForStudent/:userId', AllBookingFinderFromResultForStudent);  
ResultRouter.post('/statusUpdateByOperator', statusUpdateByOperator);  
ResultRouter.get('/statusUpdateByStudent/:userId/:resultId', StatusUpdateByStudent);  
ResultRouter.post('/updateResultVisibility', UpdateVisibility);  
ResultRouter.delete('/cancelBookingByStudent/:userId/:resultId', cancelBookingByStudent);



module.exports = {ResultRouter};


