const express = require('express');
const userController = require('../controllers/user');
const adminController = require('../controllers/admin');
const studentController = require('../controllers/student');
const auth = require("../middleware/auth");
const checkUserRole = require("../middleware/checkUserRole");

const router = express.Router();

//control middleware usage again

router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.post('/askQuestion', auth, userController.askQuestion);

router.post('/register', studentController.register);
router.post('/answerQuestion', [auth, checkUserRole("student")], studentController.addAnswer);
router.post('/uploadProfilePicture', [auth, checkUserRole("student")], studentController.uploadProfilePicture);

router.put('/admin/student/:studentId', adminController.updateStudentStatus);

module.exports = router;