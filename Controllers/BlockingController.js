const { Blocking } = require('../models'); 
// day type should be  = Feb 8  three first letter with

const BlockingInputs = async (req, res) => {
  const { blockingMonth, blockingNumber, blockingMessage } = req.body;
  const errors = [];

  // Helper function for input validation
  const validateInputs = () => {
    // Check for missing fields
    if (!blockingMessage || !blockingNumber || !blockingMonth) {
      errors.push("All fields are required.");
    } 
  };

  // Run validation
  validateInputs();

  // Check if there are any errors
  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  try {
    // Create the blocking record
    const BlockingInputsSaving = await Blocking.create({
      blockingMessage,
      blockingNumber,
      blockingMonth,
    });

    return res.status(200).json({
      message: "Blocking created successfully.",
      data: {
        blockingMessage: BlockingInputsSaving.blockingMessage,
        blockingMonth: BlockingInputsSaving.blockingMonth,
        blockingNumber: BlockingInputsSaving.blockingNumber,
      },
    });
  } catch (err) {
    if (err.name === "ValidationErrorItem") {
      const validationErrors = err.errors.map((e) => e.message);
      return res.status(400).json({ errors: [validationErrors] });
    }

    return res.status(500).json({ errors: [err.message] });
  }
};


const DeleteBlocking = async (req, res) => {
    const { blockingId} = req.params;
  
    // Validation checks
    if (!blockingId) {
      return res.status(400).json({ errors: ["Blocking ID  required"] });
    }
  
    try {
      // Find the blocking entry by ID
      const BlockingInfo = await Blocking.findByPk(blockingId);
  
      // Check if the blocking entry exists
      if (!BlockingInfo) {
        return res.status(404).json({ errors: ["Blocking Date not found."] });
      }
  
  
      // Perform the deletion of the specific blocking entry
      await Blocking.destroy({
        where: {
           blockingId 
        }
      });
  
      // Respond with a success message
      return res
        .status(200)
        .json({ message: ["Blocking deleted successfully."] });
    } catch (err) {
      if (err.name === "ValidationErrorItem") {
        const validationErrors = err.errors.map((e) => e.message);
        return res.status(400).json({ errors: [validationErrors.message] });
      }
      return res.status(500).json({ errors: [err.message] });
    }
  };
  

const GetAllBlocking = async (req, res) => {
    try {
      // Retrieve all blocking records from the database
      const allBlockingRecords = await Blocking.findAll();
      // Check if no records were found
      if (allBlockingRecords.length === 0) {
        return res.status(404).json({ errors: ["No blocking records found."] });
      }
  
      // Return the retrieved records
      return res.status(200).json({
        message: "Blocking records retrieved successfully.",
        data: allBlockingRecords,
      });
    } catch (err) {
      // Handle any errors
      return res.status(500).json({ errors: [err.message] });
    }
  };
  

  
  module.exports = {BlockingInputs,DeleteBlocking,GetAllBlocking};