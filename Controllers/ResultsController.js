
const {Result,Equipment,User} = require("../models");
const { Op } = require('sequelize');


// const AllBookingFinderFromResultForOperator = async (req, res) => {
//     const { userId } = req.params;

//     try {

//         // Fetch all results and include the related equipment details
//         const equipmentId = await Equipment.findAll({
//           where:{operatorUserID:userId}
//         })

//         const results = await Result.findAll({
//           where: { equipmentId ,userId,visibility:true},
//           include: [
//               {
//                   model: Equipment,
//                   as: 'Equipment',
//               },
//               {
//                   model: User,
//                   as: 'User',
//                   attributes: ['firstName', 'instituteId'], 
//               },
//           ],
//       });
      

//         // Check if there are no results
//         if (results.length === 0) {
//             return res.status(200).json({ message: ["No Booking/result history found."] });
//         }

//         // Now the results will include the equipmentName, you can directly send it
//         return res.status(200).json({ results });
//     } catch (err) {
//         // Handle validation or other errors
//         if (err.name === "ValidationErrorItem") {
//             const validationErrors = err.errors.map((e) => e.message);
//             return res.status(400).json({ errors: [validationErrors.message] });
//         }
//         return res.status(500).json({ errors: [err.message] });
//     }
// };

const AllBookingFinderFromResultForOperator = async (req, res) => {
  const { userId } = req.params;

  try {
      // Fetch all equipment assigned to the operator
      const equipment = await Equipment.findAll({
          where: { operatorUserID: userId }
      });

      // Extract equipmentIds from the fetched equipment
      const equipmentIds = equipment.map(e => e.equipmentId);
      // Fetch results for the operator's equipment
      const results = await Result.findAll({
          where: { 
              equipmentId: { [Op.in]: equipmentIds }, // Filter by equipmentId
              visibility: true
          },
          include: [
              {
                  model: Equipment,
                  as: 'Equipment', // Including related Equipment model
              },
              {
                  model: User,
                  as: 'User', // Including related User model
                  attributes: ['firstName', 'instituteId'], // Only select specific fields
              },
          ],
      });
console.log(results)
      // Check if there are no results
      if (results.length === 0) {
          return res.status(200).json({ message: ["No Booking/result history found."] });
      }

      // Return the results with all related details
      return res.status(200).json({ results });
  } catch (err) {
      // Handle errors
      if (err.name === "ValidationErrorItem") {
          const validationErrors = err.errors.map((e) => e.message);
          return res.status(400).json({ errors: [validationErrors.message] });
      }
      return res.status(500).json({ errors: [err.message] });
  }
};


const AllBookingFinderFromResultForStudent = async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch all results and include the related equipment details
        const results = await Result.findAll({
          where: { userId},
          include: [
              {
                  model: Equipment,
                  as: 'Equipment',
              },
              {
                  model: User,
                  as: 'User',
                  attributes: ['firstName', 'instituteId'], 
              },
          ],
      });
      

        // Check if there are no results
        if (results.length === 0) {
            return res.status(200).json({ message: ["No Booking/result history found."] });
        }

        // Now the results will include the equipmentName, you can directly send it
        return res.status(200).json({ results });
    } catch (err) {
        // Handle validation or other errors
        if (err.name === "ValidationErrorItem") {
            const validationErrors = err.errors.map((e) => e.message);
            return res.status(400).json({ errors: [validationErrors.message] });
        }
        return res.status(500).json({ errors: [err.message] });
    }
};


const StatusUpdateByStudent = async (req, res) => {
    const { userId, resultId } = req.params;
  
    try {
      // Find the result by both userId and resultId
      const ResultToUpdate = await Result.findOne({
        where: {
          userId: userId,
          resultId: resultId
        }
      });
  
      // Check if the result exists
      if (!ResultToUpdate) {
        return res.status(404).json({ errors: ["No status found to update."] });
      }
  
      // Update the studentConfirmation field to "Results collected"
      ResultToUpdate.studentConfirmation = "Results collected";
  
      // Save the update without changing other fields
      await ResultToUpdate.save();
  
      // Respond with a success message
      return res.status(200).json({ message: ["Status updated successfully."] });
  
    } catch (err) {
      // Handle validation errors if they occur
      if (err.name === "ValidationError") {
        const validationErrors = err.errors.map((e) => e.message);
        return res.status(400).json({ errors: validationErrors });
      }
  
      // General error handling
      return res.status(500).json({ errors: [err.message] });
    }
  };
  

const statusUpdateByOperator = async (req, res) => {
    const { resultId, operatorStatusConfirmation } = req.body;
  
    try {
      // Check if the resultId and operatorStatusConfirmation were provided in the request body
      if (!resultId || !operatorStatusConfirmation) {
        return res.status(400).json({ message: 'resultId and operatorStatusConfirmation are required.' });
      }
  
      // Update the Result table
      const updatedResult = await Result.update(
        { operatorStatusConfirmation },  // Values to update
        { where: { resultId }, returning: true, plain: true }  // Conditions to match
      );
  
      // If no rows were updated, it means resultId didn't match any entry in the table
      if (updatedResult[0] === 0) {
        return res.status(404).json({ message: 'Result not found.' });
      }
  
      // Successfully updated the record, return the updated data
      return res.status(200).json({ message: 'Result updated successfully.', updatedResult: updatedResult[1] });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while updating the result.', error: error.message });
    }
  };

const UpdateVisibility = async(req,res)  =>{
  const { resultId } = req.body;
  try {
    // Check if the resultId and operatorStatusConfirmation were provided in the request body
    if (!resultId) {
      return res.status(400).json({ message: 'resultId is required.' });
    }

    // Update the Result table
    const updatedResult = await Result.update(
      { visibility : false },  // Values to update
      { where: { resultId }, returning: true, plain: true }  // Conditions to match
    );

    // If no rows were updated, it means resultId didn't match any entry in the table
    if (updatedResult[0] === 0) {
      return res.status(404).json({ message: 'Result not found.' });
    }

    // Successfully updated the record, return the updated data
    return res.status(200).json({ message: 'Result Visibility updated successfully.', updatedResult: updatedResult[1] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating the result visibility.', error: error.message });
  }
}
  




  module.exports={StatusUpdateByStudent,statusUpdateByOperator,UpdateVisibility,AllBookingFinderFromResultForOperator,AllBookingFinderFromResultForStudent}


 