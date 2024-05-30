const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require("multer");
const { isEmail } = require('validator');
const auth = require("../middleware/auth");  //this auth turns yellow when I export it with a function name
const checkUserRole= require("../middleware/checkUserRole");

const Student_model= require("../models/student-model");
const StudentFile_model= require("../models/studentFile-model");
const Question_model = require("../models/question-model");
const Answer_model = require("../models/answer-model");
const University_model = require("../models/university-model");
const Department_model = require("../models/department-model");
const Faculty_model = require("../models/faculty-model");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
}).single('studentFile');

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { duplicate: '', email: '', password: ''};

  if (err.message === 'Please enter a valid email') {
    errors.email = 'Please enter a valid email';
  }

  if (err.message === 'Minimum password length') {
    errors.password = 'Minimum password length is 6 characters';
  }
  
  if (err.message === 'Validation error') {
    errors.duplicate = 'That email or username is already registered';
  }

  return errors;
}

// Registration logic
exports.register = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ errors: { file: err.message } });
    }

    const { username, email, password, university, department } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sequelize = require('../data/db'); // Adjust the path to your sequelize instance

    const transaction = await sequelize.transaction();

    try {
      // Validate email
      if (!isEmail(email)) {
        throw new Error('Please enter a valid email');
      }

      // Validate password length
      if (password.length < 6) {
        throw new Error('Minimum password length is 6');
      }

      // Create new student
      const newStudent = await Student_model.create({
        username: username,
        email: email,
        password: hashedPassword,
        university_id: university,
        department_id: department,
        approved: false
      }, { transaction });

      // Create student file entry
      await StudentFile_model.create({
        fileName: req.file.originalname,
        fileData: req.file.buffer,
        mimeType: req.file.mimetype,
        studentId: newStudent.id
      }, { transaction });

      // Commit the transaction
      await transaction.commit();

      res.redirect("/");

    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();

      const errors = handleErrors(error);
      res.status(400).json({ errors });
    }
  });
}

exports.addAnswer = async (req, res) => {
  try {
    const { question_id, answer_text } = req.body;
    const student_id = req.user.id;

    const question = await Question_model.findByPk(question_id);

    if (!question) {
      return res.status(404).send('Question not found');
    }

    await Answer_model.create({
      question_id,
      student_id,
      answer_text,
      created_at: new Date()
    });

    res.redirect(`/university/${question.uni_id}`);
  } catch (error) {
    console.error("Error adding answer:", error);
    res.status(500).send("Error adding answer.");
  }
};

exports.getProfile = async (req,res) => {
	const student = await Student_model.findOne({
		where: {
			id: req.user.id
		},
		include: [
			{
				model: Answer_model,
				include: {
					model: Question_model
				}
			},
			{
				model: University_model
			},
			{
				model: Department_model
			}
		]
	}) ;

	console.log(student);

	res.render('Student/profile', {
		user: student.dataValues,
        userType: "student" // Pass the userType
	});
}