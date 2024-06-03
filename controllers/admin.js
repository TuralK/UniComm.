const nodeMailer = require("nodemailer");
const dotenv = require('dotenv');

const Student_model = require('../models/student-model');
const StudentFile_model = require('../models/studentFile-model');
const { where } = require("sequelize");

dotenv.config({ path: './.env'});

exports.updateStudentStatus = async (req, res) => {
    const studentId = req.params.studentId;
    const isApproved = req.body.isApproved === true;

    try {
        const student = await Student_model.findOne({ 
            where: { id: studentId }
        });

        const studentFile = await StudentFile_model.findOne({
            where: {studentId: studentId}
        })

        if (!student) {
            return res.status(404).json({ errors: "Student not found." });
        }

        const emailSubject = isApproved ? 'Student Registration Approved' : 'Student Registration Rejected';
        const emailBody = `Hello ${student.username},<br><br>
            Your registration request has been ${isApproved ? "approved" : "rejected and removed from our system"}.<br><br>
            Best Regards,<br>Admin Team`;

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: '"UniComm" <enesbilalbabaturalpro06@gmail.com>',
            to: student.email,
            subject: emailSubject,
            html: emailBody
        });

        if (!isApproved) {
            await student.destroy();
            return res.status(200).json({ message: "Student registration request rejected and deleted." });
        }
        await studentFile.destroy();
        student.approved = true;
        await student.save();
        res.status(200).json({ message: "Student registration request approved." });

    } catch (err) {
        console.error("Error processing student registration request:", err);
        res.status(400).json({ errors: "Unable to process the request." });
    }
};