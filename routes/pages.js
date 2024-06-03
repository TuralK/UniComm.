const express = require('express');
const auth = require("../middleware/auth");
const checkUserRole = require("../middleware/checkUserRole");
const nodeMailer = require("nodemailer");
const bcrypt= require("bcrypt");
const jwt=require("jsonwebtoken");

const Admin_model = require("../models/admin-model");
const Student_model = require("../models/student-model");
const StudentFile_model = require("../models/studentFile-model");
const University_model = require("../models/university-model");
const Question_model = require("../models/question-model");
const Answer_model = require('../models/answer-model');
const Department_model = require('../models/department-model');
const Department = require('../models/department-model');


const router = express.Router();

async function findUserByEmail(email) {
	let user = null;
	let userType = '';

  if (email === "unicomm_admin@gmail.com") {
    user = await Admin_model.findOne({ where: { email } });
		userType = "admin";
  }
	else {
		user = await Student_model.findOne({ where: { email } });
		userType = "student";
	}

	if(user) return { user, userType };

  return null;
}

//=====================Move some gets to auth(according to user type)=====================//


//home page, (auth returns user type, null if not user)
router.get('/', auth, async (req, res) => {
  try{
    const universities = await University_model.findAll({ where: { status: 1 } });
    const universityDataValues = universities.map(university => university.dataValues);

    res.render('home', {
      user: req.user,
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
router.get("/displayFiles", [auth, checkUserRole("admin")], async (req, res) => {
  try {
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
      user: req.user,
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

    //fakulte?
    const department = await Department_model.findOne({
      attributes: ['bolum_ad'],
      where: { department_id: student.department_id },  
      include: {
        model: University_model,
        attributes: ['uni_name'],
        where: {
          uni_id: student.uni_id
        }
      } 
    });

    if (!student) {
      return res.status(404).send('Student not found');
    }
    
    const file = student.StudentFiles[0];
    if (file) {
      res.render('Admin/fileContent',
        {
          user: req.user,
          file,
          student: student.dataValues,
          uni_name: department.University.uni_name,
          department_name: department.bolum_ad
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
    const uniName = req.params.uni_name.replace(/_/g, ' '); 
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
    
    let userValues = null;
    if(req.user !== null){
      if(req.user.userType === 'student'){
        userValues = await Student_model.findByPk(req.user.id);
      }
      else if(req.user.userType === 'admin'){
        userValues = await Admin_model.findByPk(req.user.id);
      }
    }

    res.render('universityDetails', {
      user: req.user,
      userValues: userValues,
      university: university.dataValues,
      questions: questionsDataValues
    });
  } catch (error) {
    console.error("Error fetching university details:", error);
    res.status(500).send("Error fetching university details.");
  }
});

router.get('/question/:id', auth, async (req, res) => {
  const idsCookie = req.cookies.ids;
  if (!idsCookie) {
    let ids = {};
    res.cookie('ids', JSON.stringify(ids), { maxAge: 24 * 60 * 60 * 1000 }); // Update cookie
  };
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

	let userValues = null;
  if(req.user !== null){
    if(req.user.userType === 'student'){
      userValues = await Student_model.findByPk(req.user.id);
    }
    else if(req.user.userType === 'admin'){
      userValues = await Admin_model.findByPk(req.user.id);
    }
  }

	res.render('questionDetails', { 
		user: req.user,
    	userValues: userValues,
		question, 
		answers: question.Answers, 
		university: question.University,
	});
});

router.get('/profile/:id', auth, async (req, res) => {
	try {

		const student = await Student_model.findByPk(req.params.id, {
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
		});

		const questionAnswersMap = student.Answers.reduce((acc, answer) => {
			const questionText = answer.Question.question_text;
			if (!acc[questionText]) {
				acc[questionText] = [];
			}
			acc[questionText].push(answer.answer_text);
			return acc;
		}, {});

		
		res.render('Student/profile', { 
			user: req.user,
      		student: student.dataValues,
			questionAnswersMap // Pass the grouped answers map
		});

	}
	catch (error) {
		console.log("Error uploading profile picture:", error);
    res.status(500).json({ error: "Internal server error" });
	}
});


router.put('/:answerId/vote', async (req, res) => {
	const answerId = req.params.answerId;
	const idsCookie = req.cookies.ids;
	let ids = {};
  
	if (idsCookie) {
	  ids = JSON.parse(idsCookie);
	}
  
	try {
	  const answer = await Answer_model.findByPk(answerId);
	  if (!answer) {
		throw new Error("There is no such answer!");
	  }
  
	  const vote = req.query.vote;
	  const isActive = req.query.isActive;
  
	  if (!vote || (vote !== 'like' && vote !== 'dislike')) {
		return res.status(400).send('Invalid vote type');
	  }
  
	  if (isActive === 'yes') {
		if (ids[answerId] === vote) {
		  // User is un-voting
		  if (vote === 'like') {
			await answer.decrement('likes');
		  } else if (vote === 'dislike') {
			await answer.decrement('dislikes');
		  }
		  delete ids[answerId];
		}
	  } else {
		if (ids[answerId]) {
		  if (ids[answerId] === 'like') {
			await answer.decrement('likes');
		  } else if (ids[answerId] === 'dislike') {
			await answer.decrement('dislikes');
		  }
		}
  
		if (vote === 'like') {
		  await answer.increment('likes');
		} else if (vote === 'dislike') {
		  await answer.increment('dislikes');
		}
  
		ids[answerId] = vote;
	  }
  
	  await answer.reload(); // Ensure latest values are returned
	  res.cookie('ids', JSON.stringify(ids), { maxAge: 24 * 60 * 60 * 1000 }); // Update cookie
	  res.status(200).json({ likes: answer.likes, dislikes: answer.dislikes });
	} catch (error) {
	  console.error("Error recording vote:", error);
	  res.status(500).send("Error recording vote.");
	}
  });
  

router.post("/forgotPassword", async function(req, res) {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No user with that email' });
    }
    const token = jwt.sign({ id: user.user.id, userType: user.userType }, 'secretKey', { expiresIn: '5m' });

    const transporter = nodeMailer.createTransport({
        service: 'gmail',
    	auth: {
        	user: 'enesbilalbabaturalpro06@gmail.com', // your Gmail address
        	pass: 'elde beun xhtc btxu' // your Gmail password or App Password if 2FA is enabled
    	}
    });

    await transporter.sendMail({
        from: '"UniComm" <enesbilalbabaturalpro06@gmail.com>',
        to: email,
        subject: 'Password Reset Link',
		html: `<a href="http://localhost:3000/changePassword?token=${token}">Reset Password</a>`
    });
    res.status(200).json({ success: 'Password reset link has been sent.' });
});

router.get('/changePassword', (req, res) => {
    const { token } = req.query;

    // Check if the token exists
    if (!token) {
        return res.status(400).send('No token provided.');
    }

    try {
		const decoded = jwt.verify(token, 'secretKey');
        // If token is valid, render the page with the token
        res.render('changePassword', { token });
    } catch (err) {
        // Handle different errors differently
        if (err.name === 'TokenExpiredError') {
            res.status(401).send('Token has expired.');
        } else {
            res.status(400).send('Invalid or expired token');
        }
    }
});

router.post('/changePassword', async (req, res) => {
    const { password, confirmPassword, token } = req.body;
    if (password.length < 6) {
        return res.status(404).json({ error: 'Minimum password length is 6 characters' });
    }

	if (password !== confirmPassword) {
		return res.status(404).json({ error: 'Passwords do not match' });
	}

    try {
		//console.log(decoded);
		const decoded = jwt.verify(token, 'secretKey');
        const { id, userType } = decoded;
        let model;
        switch (userType) {
            case 'admin':
                model = Admin_model;
                break;
            case 'student':
                model = Student_model;
                break;
            default:
                return res.status(400).json({ error: 'Invalid user type' });
        }

		const user = await model.findOne({ where: { id } });

		const checkPassword= await bcrypt.compare(password,user.password);
		
        if(checkPassword) {
			return res.status(400).json({ error: 'New password must be different from the current password.' });
		}

        const hashedPassword = await bcrypt.hash(password, 10);
        await model.update( { password: hashedPassword }, { where: { id } } );
		res.status(200).json({ success: 'password updated succesfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});
 
module.exports = router;