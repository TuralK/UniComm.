const express = require('express');
const auth = require("../middleware/auth");
const checkUserRole = require("../middleware/checkUserRole");

const Admin_model = require("../models/admin-model");
const Student_model = require("../models/student-model");
const StudentFile_model = require("../models/studentFile-model");
const University_model = require("../models/university-model");
const Question_model = require("../models/question-model");
const Answer_model = require('../models/answer-model');
const University = require('../models/university-model');
const Question = require('../models/question-model');

const router = express.Router();

//=====================Move some gets to auth(according to user type)=====================//


//home page, (auth returns user type, null if not user)
router.get('/', auth, async (req, res) => {
  try{
    const universities = await University_model.findAll({ where: { status: 1 } });
    const universityDataValues = universities.map(university => university.dataValues);

    let userType = null;
    if(req.user !== null){
      userType = req.user.userType;
    }
    res.render('home', {
      user: req.user,
      userType: userType,
      universities: universityDataValues
    });
  } catch(error){
    console.error("Error fetching universities:", error);
    res.status(500).send("Error fetching universities.");
  }
});


//profile page for user
/*router.get('/profile', auth, (req, res) => {

  	if (req.user.userType === "student") {
    	res.render('student/profile', {
    	  	user: req.user
    	});
	}
	else if(req.user.userType === "admin") {
		res.render('admin/profile', {
			user: req.user
	  	});
	}
   	else {
   	 	res.redirect('/');
  	}
});*/

//register page
router.get("/register", async (req, res) => {
  if(req.user) {
    res.redirect("/");
  } else {
    try {
      const universities = await University_model.findAll({ where: { status: 1 } });
      const universityDataValues = universities.map(university => university.dataValues);
      res.render("register", { universities: universityDataValues });
    } catch (error) {
      console.error("Error fetching universities:", error);
      res.status(500).send("Error fetching universities.");
    }
  }
});

router.get("/login", auth,(req, res) => {
  if(req.user){
    res.redirect("/");
  } else {
    res.render("login");
  }
});


//admin's page, where he/she can see all requests
//////////////////////////////////////////// check again(sending values to displayFiles) ////////////////////////////
//////////////////////////////////////////// uncheckedStudentFiles can be null check again //////////////////////////
//////////////////////////////////////////// unchecked student files include right students???///////////////////////
router.get("/displayFiles", [auth, checkUserRole("admin")], async (req, res) => {
  try {
    let admin = await Admin_model.findOne({ where: { id: req.user.id }, attributes: { exclude: ['password'] } });
    const uncheckedStudentFiles = await StudentFile_model.findAll({
      include: {
        model: Student_model,
        where: {
          approved: false
        }
      }
    });
    const uncheckedStudentFilesDataValues = uncheckedStudentFiles.map(uncheckedStudentFile => uncheckedStudentFile.dataValues);

    res.render("Admin/displayFiles", {
      user: admin.dataValues,
      userType: "admin",
      dataValues: admin.dataValues,
      studentFiles: uncheckedStudentFilesDataValues
    });
  } catch (error) {
    console.error("Error fetching Student Files requests:", error);
    res.status(500).send("Error fetching Student Files requests.");
  }
});

//admin's page, after clicking to any request displayed on displayFiles, it opens file where admin can accept or reject request
router.get('/file/:username', [auth, checkUserRole("admin")], async (req, res) => {
  try {
    const student = await Student_model.findOne({
      where: { username: req.params.username },
      include: StudentFile_model
    });

    if (!student) {
      return res.status(404).send('Student not found');
    }

    const file = student.StudentFiles[0];
    if (file) {
      res.render('Admin/fileContent',
        {
          file,
          username: req.params.username,
          student: student.dataValues
        });
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).send('Error fetching file.');
  }
});


//shows file inside /file/:username page
router.get('/serveFile/:id', [auth, checkUserRole("admin")], async (req, res) => {
  try {
    const file = await StudentFile_model.findByPk(req.params.id);
    if (file) {
      res.setHeader('Content-Type', file.mimeType);
      res.send(file.fileData);
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).send('Error serving file.');
  }
});

//clicing university opens related university page
router.get('/university/:uni_name', auth, async (req, res) => {
  try {
    const uniName = req.params.uni_name.replace(/-/g, ' ');

    const university = await University_model.findOne({
      where : {uni_name: uniName}
    });
    
    if (!university) {
      return res.status(404).send('University not found');
    }

    //const questions = await Question_model.findAll({ where: { uni_id: req.params.id } });
    const questions = await Question_model.findAll({
      where: { uni_id: university.uni_id },
      include: {
        model: Answer_model,
        include: {
          model: Student_model,
          attributes: ['username']
        }
      }
    });
    const questionsDataValues = questions.map(question => question.dataValues);
    
    let user = null;
    let userType = null;
    if(req.user !== null){
      if(req.user.userType === 'student'){
        user = await Student_model.findByPk(req.user.id);
        userType = 'student';
      }
      else if(req.user.userType === 'admin'){
        user = await Admin_model.findByPk(req.user.id);
        userType = 'admin';
      }
    }

    res.render('universityDetails', {
      user: user,
      userType: userType,
      university: university.dataValues,
      questions: questionsDataValues
    });
  } catch (error) {
    console.error("Error fetching university details:", error);
    res.status(500).send("Error fetching university details.");
  }
});

router.get('/question/:id', auth, async (req, res) => {
	const question = await Question_model.findByPk(req.params.id, {
		include: [
			{ 
				model: Answer_model, 
				include: [
					Student_model
				]
			},
			{
				model: University_model
			}
		]
	});

	let user = null;
    let userType = null;
    if(req.user !== null){
      if(req.user.userType === 'student'){
        user = await Student_model.findByPk(req.user.id);
        userType = 'student';
      }
      else if(req.user.userType === 'admin'){
        user = await Admin_model.findByPk(req.user.id);
        userType = 'admin';
      }
    }

	res.render('questionDetails', { 
		user,
		userType,
		question, 
		answers: question.Answers, 
		university: question.University,
	});
});

module.exports = router;