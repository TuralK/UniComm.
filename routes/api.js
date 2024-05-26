const express = require('express');
const Faculty_model = require("../models/faculty-model");
const Department_model = require("../models/department-model");

const router = express.Router();

router.get('/faculties/:universityId', async (req, res) => {
  try {
    const faculties = await Faculty_model.findAll({ where: { uni_id: req.params.universityId, status: 1 } });
    res.json(faculties);
  } catch (err) {
    console.error("Error fetching faculties:", err);
    res.status(500).send("Error fetching faculties.");
  }
});

router.get('/departments/:facultyId', async (req, res) => {
  try {
    const departments = await Department_model.findAll({ where: { fakulte_id: req.params.facultyId, status: 1 } });
    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).send("Error fetching departments.");
  }
});

module.exports = router;
