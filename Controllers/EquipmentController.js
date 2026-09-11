
const { Equipment,User } = require('../models'); 


const addEquipment = async (req, res) => {
  const {
    equipmentName,
    equipmentModel,
    guidelines,
    maxSamples,
    maxBookingsPerTwoWeeks,
    operatorId,
    workingStatus,
  } = req.body;


  try {
    // Fetch operator details based on the operatorId
    const operator = await User.findOne({
      where: { userId: operatorId },
    });
    if (!operator) {
      return res.status(404).json({ message: "Operator not found" });
    }

    // Create a new equipment record using operator information
    const newEquipment = await Equipment.create({
      equipmentName,
      equipmentModel,
      guidelines,
      maxSamples,
      maxBookingsPerTwoWeeks,
      operatorName: operator.firstName,
      operatorEmail: operator.email,
      operatorPhoneNumber: operator.mobileNumber,
      workingStatus,
      operatorUserID:operatorId
    });

    res.status(201).json({
      message: "Equipment added successfully",
      data: newEquipment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add equipment",
      error: error.message,
    });
  }
};

//  update inserted equipments based on availability 
const updateEquipmentWorkingStatus = async (req, res) => {
  const { workingStatus,equipmentId } = req.body; 
console.log(workingStatus,equipmentId )
  try {
    // Find the equipment by ID
    const equipment = await Equipment.findByPk(equipmentId);

    if (!equipment) {
      return res.status(404).json({
        message: 'Equipment not found',
      });
    }

    // Update the workingStatus field
    await equipment.update({ workingStatus });

    res.status(200).json({
      message: 'Equipment working status updated successfully',
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update equipment working status',
      error: error.message,
    });
  }
};


// get all equipments 
const getAllEquipments = async (req, res) => {
    try {
      const equipments = await Equipment.findAll();
  
      res.status(200).json({
        message: 'Equipments retrieved successfully',
        data: equipments,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to fetch equipments',
        error: error.message,
      });
    }
  };

//  get equipments not functioning
// const getEquipmentsOutOfFunction = async (req,res)=>{
    
// }


// get single equipment 
const getEquipmentById = async (req, res) => {
    const { equipmentId } = req.params; // Extract equipmentId from request parameters
  
    try {
      // Find the equipment by its ID
      const equipment = await Equipment.findByPk(equipmentId);
  
      if (!equipment) {
        return res.status(404).json({
          message: 'Equipment not found',
        });
      }
  
      res.status(200).json({
        message: 'Equipment retrieved successfully',
        data: equipment,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to fetch equipment',
        error: error.message,
      });
    }
  };
  
  
//  delete equipments
const deleteEquipment = async (req, res) => {
    const { equipmentId } = req.params; // The ID of the equipment to delete
  
    try {
      // Find the equipment by ID
      const equipment = await Equipment.findByPk(equipmentId);
  
      if (!equipment) {
        return res.status(404).json({
          message: 'Equipment not found',
        });
      }
  
      // Delete the equipment
      await equipment.destroy();
  
      res.status(200).json({
        message: 'Equipment deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to delete equipment',
        error: error.message,
      });
    }
  };


  const getOperator = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
        where: { role: 1 }, 
      });
      if (users.length === 0) {
        return res.status(200).json({ message: ["No operator found."] });
      }
  
      // Respond with the list of users
      return res.status(200).json({ users });
    } catch (err) {
      if (err.name === "ValidationErrorItem") {
        const validationErrors = err.errors.map((e) => e.message);
        return res.status(400).json({ errors: [validationErrors.message] });
      }
      return res.status(500).json({ errors: [err.message] });
    }
  };
  

  module.exports = { addEquipment,updateEquipmentWorkingStatus,getAllEquipments,getEquipmentById,deleteEquipment,getOperator };