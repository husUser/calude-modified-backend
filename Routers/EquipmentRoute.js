const express = require('express');
const { addEquipment,updateEquipmentWorkingStatus,getAllEquipments,getEquipmentById,deleteEquipment,getOperator } = require('../Controllers/EquipmentController');
const EquipmentRoute = express.Router();

EquipmentRoute.post('/equipmentDetails', addEquipment);
EquipmentRoute.patch('/updateEquipmentWorkingStatus', updateEquipmentWorkingStatus);
EquipmentRoute.get('/getAllEquipmentDetails', getAllEquipments);
EquipmentRoute.get('/getSingleEquipmentDetails/:equipmentId', getEquipmentById);
EquipmentRoute.delete('/deleteEquipmentDetails/:equipmentId', deleteEquipment);
// EquipmentRoute.get('/getEquipmentNotFunctioning', getEquipmentsOutOfFunction);
EquipmentRoute.get('/getOperator', getOperator);

module.exports = {EquipmentRoute};


