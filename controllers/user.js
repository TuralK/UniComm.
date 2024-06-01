const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // or bcryptjs?
const jwt = require("jsonwebtoken");
/*
const nodeMailer = require("nodemailer");
const { promisify } = require('util');
const { emit } = require("process");
*/

const Student_model= require("../models/student-model");
const Admin_model= require("../models/admin-model");
const Question_model = require("../models/question-model");
const University_model = require("../models/university-model");

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

const handleErrors = (err) => {
  //console.log(err.message, err.code);
  let errors = { error: '' };

  if (err.message === "Wrong username or password") {
    errors.error = "Wrong username or password";
  }

  if (err.message === "Pending approval...") {
    errors.error = "Pending approval...";
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
      // console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
      });
  }

  return errors;
}

exports.login = async (req, res) => {
  const {email, password } = req.body;

  try{
    const user = await findUserByEmail(email);
    if(!user) {
			throw Error("Wrong username or password");
		}

    const checkPassword = await bcrypt.compare(password, user.user.password);

    if(!checkPassword) {
			throw Error("Wrong username or password");
		}

    if (user.userType === "student") {
			if (user.user.approved === false) {
				throw Error("Pending approval...");
			}
		}
    const token = jwt.sign({ id: user.user.id, userType: user.userType }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    }
    res.cookie('jwt', token, cookieOptions);
		res.status(200).json({ user: user.userType });
  }
  catch (error){
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
}

exports.logout = async (req, res) => {
  res.clearCookie('jwt');
  res.status(200).redirect('/');
}

exports.askQuestion = async (req, res) => {
  try {
    const { uni_id, question_text } = req.body;
    await Question_model.create({
      uni_id,
      question_text,
      created_at: new Date()
    });

	const university = await University_model.findOne({
		where : { uni_id }
	});

    res.redirect(`/university/${university.uni_name.replace(/ /g, '_')}`);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).send("Error creating question.");
  }
};