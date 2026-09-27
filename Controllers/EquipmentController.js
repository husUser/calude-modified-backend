
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


  // Assign/re-assign an operator to an existing equipment.
  // Mirrors the operator-copy logic already used in addEquipment: operator
  // details (name/email/phone) are never trusted from the request body,
  // they are always re-read from the User table on the server.
  const transferOperator = async (req, res) => {
    const { equipmentId, operatorUserId } = req.body;

    if (!equipmentId) {
      return res.status(400).json({
        message: "equipmentId is required",
      });
    }

    if (!operatorUserId) {
      return res.status(400).json({
        message: "operatorUserId is required",
      });
    }

    try {
      // Equipment must exist
      const equipment = await Equipment.findByPk(equipmentId);
      if (!equipment) {
        return res.status(404).json({
          message: "Equipment not found",
        });
      }

      // Selected user must exist
      const operator = await User.findOne({
        where: { userId: operatorUserId },
      });
      if (!operator) {
        return res.status(404).json({
          message: "Operator not found",
        });
      }

      // Selected user must actually be an operator (role 1), per the
      // existing role model used by getOperator
      if (parseInt(operator.role, 10) !== 1) {
        return res.status(400).json({
          message: "Selected user is not a valid operator",
        });
      }

      // Update only the operator-related columns on the existing row
      await equipment.update({
        operatorName: operator.firstName,
        operatorUserID: operator.userId,
        operatorEmail: operator.email,
        operatorPhoneNumber: operator.mobileNumber,
      });

      res.status(200).json({
        message: "Equipment operator updated successfully",
        data: equipment,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update equipment operator",
        error: error.message,
      });
    }
  };


  module.exports = { addEquipment,updateEquipmentWorkingStatus,getAllEquipments,getEquipmentById,deleteEquipment,getOperator,transferOperator };