const { Professor,User,Booking,Equipment } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


const sendEmail = async (email, password) => {
  try {
    let mailSender = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const details = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Credentials for accessing IA lab professors portal",
      html: `
        <html>
        <head>
          <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f6f6f6;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                border: 1px solid #cccccc;
            }
            .header {
                text-align: center;
                padding: 10px 0;
            }
            .content {
                text-align: center;
                padding: 20px;
            }
            .cta-button {
                display: inline-block;
                padding: 15px 25px;
                margin: 20px 0;
                background-color: #FF8318;
                color: #ffffff;
                font-weight: bold;
                text-decoration: none;
                border-radius: 5px;
                text-align: center;
            }
            .footer {
                text-align: center;
                padding: 10px 0;
                font-size: 12px;
                color: #777777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#007BFF"/>
                <h1>IA Lab.</h1>
              </svg>
            </div>
            <div class="content">
              <h3>Credentials to access IA lab Professor's portal</h3>
              <h5>Make sure to update your password using the forgot password option upon login</h5>
              <p><b>Email</b>: ${email}</p>
              <p><b>Password</b>: ${password}</p>
            </div>
            <div class="footer">
              <p>If you did not sign up for this account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await mailSender.sendMail(details);
    console.log("Email sent successfully to:", email);
    
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

const sendEmailResetForProfessor = async (email, resetLink) => {
  try {
    let mailSender = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const details = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request For Professors",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Update Password</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f6f6f6;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border: 1px solid #cccccc;
                }
                .header {
                    text-align: center;
                    padding: 10px 0;
                }
                .content {
                    text-align: center;
                    padding: 20px;
                }
                .cta-button {
                    display: inline-block;
                    padding: 15px 25px;
                    margin: 20px 0;
                    background-color: #FF8318;
                    color: #ffffff;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 5px;
                    text-align: center;
                }
                .footer {
                    text-align: center;
                    padding: 10px 0;
                    font-size: 12px;
                    color: #777777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="#007BFF"/>
                        <h1>IA Lab.</h1>
                    </svg>
                </div>
                <div class="content">
                    <h3>Update your password</h3>
                    <h5>Click the button below to update the password which was provided to you from the admin section</h5>
                    
                    <a href="${resetLink}" class="cta-button">Update Password</a>
                </div>
                <div class="footer">
                    <p>If you did not sign up for this account, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await mailSender.sendMail(details);
    console.log("Password reset email sent successfully to:", email);
    
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

const createProfessorProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, labName, password, labRoomNumber } = req.body;

    // Trim inputs
    const trimmedFirstName = firstName?.trim() || "";
    const trimmedLastName = lastName?.trim() || "";
    const trimmedEmail = email?.trim().toLowerCase() || "";
    const trimmedLabName = labName?.trim() || "";
    const trimmedLabRoomNumber = labRoomNumber?.trim() || "";
    const trimmedPassword = password?.trim() || "";

    // Validate fields
    const errors = [];
    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPassword) 
      errors.push("Required fields: firstName, lastName, email, password.");

    if (!/^[A-Za-z]+$/.test(trimmedFirstName)) errors.push("First name must contain only letters.");
    if (!/^[A-Za-z]+$/.test(trimmedLastName)) errors.push("Last name must contain only letters.");
    if (!/^[^\s@]+@.*\.iitr\.ac\.in$/.test(trimmedEmail)) errors.push("Invalid IITR email address.");
    if (trimmedLabName && !/^[A-Za-z0-9 ]+$/.test(trimmedLabName)) errors.push("Invalid lab name.");
    if (trimmedLabRoomNumber && !/^[A-Za-z0-9-]+$/.test(trimmedLabRoomNumber)) errors.push("Invalid lab room number.");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/.test(trimmedPassword)) 
      errors.push("Weak password. Include uppercase, lowercase, number, and special char.");

    if (errors.length > 0) return res.status(400).json({ errors });

    // Hash password
    const hashPassword = await bcrypt.hash(trimmedPassword, 10);
    const lowerCasedEmail = trimmedEmail.toLowerCase()
    // Find or create professor
    const [professor, created] = await Professor.findOrCreate({
      where: { email: lowerCasedEmail },
      defaults: {
        firstName: `Dr.${trimmedFirstName}`,
        lastName: trimmedLastName,
        labName: trimmedLabName || null,
        labRoomNumber: trimmedLabRoomNumber || null,
        password: hashPassword,
      },
    });

    if (!created) return res.status(400).json({ error: "Professor profile already exists" });

    // Send email asynchronously
    sendEmail(professor.email, password).catch(console.error);

    return res.status(201).json({ message: "Professor profile created successfully", professor });

  } catch (err) {
    console.error("Error in createProfessorProfile:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const allProfessorsFinder = async (req, res) => {
  try {
    // Fetch all professors, excluding sensitive fields like password
    const AllProfessors = await Professor.findAll({
      attributes: { exclude: ["password"] }, // Ensure password is never exposed
    });

    // Return the result (empty array if no records found)
    return res.status(200).json({ professors: AllProfessors });

  } catch (err) {
    console.error("Error in allProfessorsFinder:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const deleteProfessor = async (req, res) => {
    const { professorId } = req.params;
  
    try {
      // Check if the professor exists
      const professor = await Professor.findByPk(professorId);
  
      if (!professor) {
        return res.status(404).json({
          errors: ["Professor not found with the provided ID."],
        });
      }
  
      // Delete the professor
      await professor.destroy();
  
      return res.status(200).json({
        message: "Professor deleted successfully.",
      });
    } catch (err) {
      return res.status(500).json({
        errors: [err.message],
      });
    }
  };
  
const ProfessorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Trim input values
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Find the user by email
    const user = await Professor.findOne({ where: { email: trimmedEmail } });

    // Always return "Invalid credentials" (Prevents email enumeration)
    if (!user || !(await bcrypt.compare(trimmedPassword, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.professorId,
        userName: user.firstName,
        userEmail: user.email,
        userRole: "5",
        verification: user.verification,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "3d" }
    );

    // Send response with token
    res.setHeader("Authorization", `Bearer ${token}`);
    return res.status(200).json({
      message: "User logged in successfully",
      token, // Include token in response (optional)
    });

  } catch (err) {
    console.error("Error in ProfessorLogin:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const ProfessorResetRequest = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Find the professor (but don’t indicate existence in response)
    const user = await Professor.findOne({ where: { email } });

    // Always return a generic response to prevent email enumeration
    res.status(200).json({ message: "Reset link has been sent." });

    // If user doesn't exist, don't proceed further
    if (!user) return;

    // Create password reset link
    const resetLink = `http://${process.env.FRONTEND_URL}/ProfessorPasswordReset/${user.professorId}`;

    // Send email asynchronously (background execution)
    sendEmailResetForProfessor(user.email, resetLink).catch(console.error);

  } catch (err) {
    console.error("Error in ProfessorResetRequest:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const ProfessorPasswordUpdate = async (req, res) => {
  try {
    const { professorId } = req.params;
    const { newPassword } = req.body;

    // Validate professorId
    const parsedProfessorId = parseInt(professorId, 10);
    if (isNaN(parsedProfessorId)) {
      return res.status(400).json({ error: "Invalid professor ID." });
    }

    // Validate new password
    if (!newPassword) {
      return res.status(400).json({ error: "New password is required." });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be at least 6 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the professor's password directly
    const [updatedRows] = await Professor.update(
      { password: hashedPassword },
      { where: { id: parsedProfessorId } } // Change "id" to "professorId" if your schema uses that
    );

    // If no rows were updated, professor was not found
    if (updatedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({ message: "Password updated successfully." });

  } catch (err) {
    console.error("Error in ProfessorPasswordUpdate:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const GetProfessorStudents = async (req, res) => {
  try {
    const { professorId } = req.params;

    // Validate professorId (ensure it's provided and is a number)
    if (!professorId) {
      return res.status(400).json({ error: "Professor ID is required." });
    }

    // const parsedProfessorId = parseInt(professorId.trim(), 10);
    // if (isNaN(parsedProfessorId)) {
    //   return res.status(400).json({ error: "Invalid professor ID." });
    // }

    // console.log(parsedProfessorId)
    // Fetch students assigned to the professor
    const students = await User.findAll({
      where: { guideId: professorId },
      attributes: { exclude: ["password"] }, // Ensure passwords are never exposed
    });
console.log(students)
    return res.status(200).json({ students });

  } catch (err) {
    console.error(`Error in GetProfessorStudents (Professor ID: ${req.params.professorId}):`, err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const deleteProfessorStudents = async(req, res) => {
  const { studentId } = req.params;

  try {
    // Check if the student exists
    const studentToDelete = await User.findByPk(studentId);
    if (!studentToDelete) {
      return res.status(404).json({
        errors: ["No student with the provided ID."],
      });
    }

    // Delete the student
    await User.destroy({
      where: { userId: studentId } 
    });

    return res.status(200).json({
      message: "Student deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      errors: [err.message],
    });
  }
};




const viewStudentBooking = async (req, res) => {
  try {
    const { userId, guideId } = req.params;
console.log(userId , "and" ,guideId)
    const bookingHistoryOfStudent = await Booking.findAll({
      where: { userId: userId, guideId: guideId }, // Remove guideId if unnecessary
      include: {
        model: Equipment,
        attributes: ["equipmentName"], // Fetch only equipment name
      },
      attributes: ["bookingId", "bookedDate", "slotTime", "slotDate", "bookingStatus"], // Fetch only necessary fields
    });
console.log(bookingHistoryOfStudent)
    // Return the result (empty array if no records found)
    return res.status(200).json({ bookingHistory: bookingHistoryOfStudent });

  } catch (err) {
    console.error("Error in viewStudentBooking:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};




module.exports = {
    allProfessorsFinder,createProfessorProfile,deleteProfessor,ProfessorLogin,ProfessorResetRequest,ProfessorPasswordUpdate,GetProfessorStudents,deleteProfessorStudents,viewStudentBooking
  };