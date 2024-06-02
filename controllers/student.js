const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require("multer");
const { isEmail } = require('validator');
const auth = require("../middleware/auth");  //this auth turns yellow when I export it with a function name
const checkUserRole= require("../middleware/checkUserRole");
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

const Student_model= require("../models/student-model");
const StudentFile_model= require("../models/studentFile-model");
const Question_model = require("../models/question-model");
const Answer_model = require("../models/answer-model");
const University_model = require("../models/university-model");
const Department_model = require("../models/department-model");
const Faculty_model = require("../models/faculty-model");
const { profile } = require('console');

const {
  mergeCookies,
  fetchInitialPage,
  extractToken,
  submitFirstForm,
  extractSecondToken,
  submitSecondForm,
  extractThirdToken,
  submitThirdForm,
  verifyDocument
} = require('../helper scripts/documentVerification');

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

const upload_picture = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
	  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
	  if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	  } else {
		cb(new Error('Invalid file type'), false);
	  }
	}
  }).single('profilePicture');

const handleErrors = (err) => {
  let errors = { duplicate: '', email: '', password: ''};

  if (err.message === 'Please enter a valid email') {
    errors.email = 'Please enter a valid email';
  }

  if (err.message === 'Minimum password length') {
    errors.password = 'Minimum password length is 6 characters';
  }
  
  if (err.message === 'Validation error') {
    errors.duplicate = 'That email is already registered';
  }

  return errors;
}

// Registration logic
exports.register = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ errors: { file: err.message } });
    }

    const { username, email, password, university, faculty, department } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const sequelize = require('../data/db'); // Adjust the path to your sequelize instance

    let isApproved = false;

    const extractTextFromPDF = async (fileBuffer) => {
      const data = await pdf(fileBuffer);
      return data.text;
    };

    try {
      // Validate email
      if (!isEmail(email)) {
        throw new Error('Please enter a valid email');
      }

      // Validate password length
      if (password.length < 6) {
        throw new Error('Minimum password length');
      } 

      if (
        await Student_model.findOne({
        where : {email: email}
        })){
        throw new Error('Validation error');
      }

      const University = await University_model.findOne({
        attributes: ['uni_name'],
        where: { uni_id: university },  
        include: {
          model: Faculty_model,
          attributes: ['fakulte_ad'],
          where: {
            fakulte_id: faculty
          },
          include: {
            model: Department_model,
            attributes: ['bolum_ad'],
            where: {
              department_id: department
            }
          }
        } 
      }); //attributes: [''] bir tek name mi alinsin, yoksa tum info
      
      university_name = University.uni_name;
      faculty_name = University.Faculties[0].fakulte_ad;
      department_name = University.Faculties[0].Departments[0].bolum_ad;

      const fileBuffer = req.file.buffer;
      const extractedText = await extractTextFromPDF(fileBuffer);

      const normalizeText = text => text.replace(/\s+/g, ' ').trim();
      const normalizedText = normalizeText(extractedText);

      // Extract barcode
      const barcodeMatch = normalizedText.match(/^[A-Z0-9]+/m);
      const barcode = barcodeMatch ? barcodeMatch[0] : null;

      // Extract T.C. Kimlik No
      const tcKimlikMatch = normalizedText.match(/(\d{11})\s*T\.C\. Kimlik No/);
      const tcKimlik = tcKimlikMatch ? tcKimlikMatch[1] : null;

      // Extract university name
      const universityMatch = normalizedText.match(/Program\s*([^\/]+)\/[^\/]+\/[^\/]+\//);
      const extractedUniversity = universityMatch ? universityMatch[1].trim() : null;

      // Extract faculty name
      const facultyMatch = normalizedText.match(/Program\s*[^\/]+\/([^\/]+)\/[^\/]+\//);
      const extractedFaculty = facultyMatch ? facultyMatch[1].trim() : null;

      // Extract department name
      const departmentMatch = normalizedText.match(/Program\s*[^\/]+\/[^\/]+\/([^\/]+)\//);
      const extractedDepartment = departmentMatch ? departmentMatch[1].trim() : null;

      const success = await verifyDocument(barcode, tcKimlik);
      if (
        university_name === extractedUniversity &&
        faculty_name === extractedFaculty &&
        department_name === extractedDepartment &&
        success
      ){
        isApproved = true;
      }

      const newStudent = await Student_model.create({
          username: username,
          email: email,
          password: hashedPassword,
          uni_id: university,
          department_id: department,
          approved: isApproved
      });

      if (!isApproved) {
      // Create student file entry
        await StudentFile_model.create({
          fileName: req.file.originalname,
          fileData: req.file.buffer,
          mimeType: req.file.mimetype,
          studentId: newStudent.id
        });
      }

      //
      if(isApproved){
        const token = jwt.sign({ id: newStudent.id, userType: "student" }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });
        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }
        res.cookie('jwt', token, cookieOptions);
		  return res.status(200).json({ message: "user added to database" })
      }
      res.status(200).json({ message: "registration pending..." })
    } catch (error) {
      	const errors = handleErrors(error);
      	res.status(400).json({ errors });
    }
  });
}

exports.addAnswer = async (req, res) => {
  try {
    const { question_id, answer_text } = req.body;
    const student_id = req.user.id;

    const question = await Question_model.findByPk(question_id, {
		include: [
			{
				model: University_model
			}
		]
	});	

    if (!question) {
      return res.status(404).send('Question not found');
    }

    await Answer_model.create({
      question_id,
      student_id,
      answer_text,
      created_at: new Date()
    });

    res.redirect(`/question/${question_id}`);
  } catch (error) {
    console.error("Error adding answer:", error);
    res.status(500).send("Error adding answer.");
  }
};

exports.uploadProfilePicture = async (req, res) => {
    upload_picture(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            // Find the student by ID
            const student = await Student_model.findByPk(req.user.id);

            if (!student) {
                return res.status(404).json({ error: "Student not found" });
            }

            // Check if there's a file attached
            if (!req.file) {
                return res.status(400).json({ error: "No file attached" });
            }

            // Get the file extension of the uploaded file
            const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

            // Construct the path to save the profile picture with the correct file extension
            const profilePicturePath = `/profile_${student.id}.${fileExtension}`;
			      const profilePictureAbsolutePath = path.join(__dirname, '..', 'profile_pictures', `profile_${student.id}.${fileExtension}`);

            // Iterate over possible file extensions and delete the old profile picture if exists
            const possibleExtensions = ['png', 'jpg', 'jpeg'];
            possibleExtensions.forEach(ext => {
                const oldProfilePicturePath = 'profile_pictures/' + `profile_${student.id}.${ext}`;
                if (fs.existsSync(oldProfilePicturePath)) {
                    fs.unlinkSync(oldProfilePicturePath);
                }
            });

            // Save the profile picture
            fs.writeFileSync(profilePictureAbsolutePath, req.file.buffer);

			    student.profilePicture = profilePicturePath;
            await student.save();

            res.json({ message: "Profile picture uploaded successfully" });
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
