const express = require('express');
const {  allProfessorsFinder,createProfessorProfile,deleteProfessor,ProfessorPasswordUpdate,ProfessorResetRequest,ProfessorLogin,GetProfessorStudents,deleteProfessorStudents,viewStudentBooking} = require('../Controllers/ProfessorsController');
const ProfessorsRoute = express.Router();

ProfessorsRoute.get('/getAllProfessors', allProfessorsFinder);
ProfessorsRoute.post('/createProfessorProfile', createProfessorProfile);
ProfessorsRoute.delete('/deleteProfessorProfile/:professorId', deleteProfessor);
ProfessorsRoute.post('/professorLogIn', ProfessorLogin);
ProfessorsRoute.post('/professorPasswordRequest', ProfessorResetRequest);
ProfessorsRoute.post('/professorsPasswordReset/:professorId', ProfessorPasswordUpdate);
ProfessorsRoute.get('/getAllProfessorStudents/:professorId', GetProfessorStudents);
ProfessorsRoute.delete('/deleteProfessorStudent/:studentId', deleteProfessorStudents);
ProfessorsRoute.get('/viewStudentBooking/:userId/:guideId', viewStudentBooking);




module.exports = {ProfessorsRoute};


