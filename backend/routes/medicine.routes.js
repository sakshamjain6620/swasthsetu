const express = require('express');
const router = express.Router();
const { getPatientMedicineRoutine, markMedicineTaken, getMedicineLogs } = require('../controllers/medicine.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/routine/patient/:patientId', verifyToken, getPatientMedicineRoutine);
router.put('/routine/:routineId/take', verifyToken, markMedicineTaken);
router.get('/logs/patient/:patientId', verifyToken, getMedicineLogs);

module.exports = router;
