const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getPatientMedicineRoutine = (req, res, next) => {
    try {
        const patientId = req.params.patientId;
        const { date } = req.query; // YYYY-MM-DD
        const targetDate = date || new Date().toISOString().split('T')[0];

        const routines = db.prepare(`
            SELECT mr.*, pm.medicine_name, pm.dosage, pm.timing, pm.instructions, pm.before_after_food
            FROM medicine_routines mr
            JOIN prescription_medicines pm ON mr.medicine_id = pm.id
            WHERE mr.patient_id = ? AND mr.routine_date = ?
            ORDER BY 
                CASE mr.routine_time
                    WHEN 'Morning' THEN 1
                    WHEN 'Afternoon' THEN 2
                    WHEN 'Evening' THEN 3
                    WHEN 'Night' THEN 4
                    ELSE 5
                END ASC
        `).all(patientId, targetDate);

        return res.json({ success: true, data: routines });
    } catch (err) {
        next(err);
    }
};

const markMedicineTaken = (req, res, next) => {
    const transaction = db.transaction((routineId) => {
        const routine = db.prepare("SELECT * FROM medicine_routines WHERE id = ?").get(routineId);
        if (!routine) {
            throw new Error('Routine log not found');
        }

        // 1. Update routine status
        db.prepare("UPDATE medicine_routines SET status = 'taken' WHERE id = ?").run(routineId);

        // 2. Insert into medicine_logs
        const logId = uuidv4();
        db.prepare(`
            INSERT INTO medicine_logs (id, routine_id, patient_id, taken_at, status)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'taken')
        `).run(logId, routineId, routine.patient_id);

        // 3. Check if all routines for this prescription are completed
        const pendingCount = db.prepare(`
            SELECT COUNT(*) as count 
            FROM medicine_routines 
            WHERE prescription_id = ? AND status = 'pending'
        `).get(routine.prescription_id);

        if (pendingCount.count === 0) {
            // Set all routines of this prescription to completed
            db.prepare("UPDATE medicine_routines SET status = 'completed' WHERE prescription_id = ? AND status = 'taken'").run(routine.prescription_id);
        }

        return { routineId, status: 'taken' };
    });

    try {
        const result = transaction(req.params.routineId);
        return res.json({
            success: true,
            message: 'Medicine marked as taken successfully.',
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const getMedicineLogs = (req, res, next) => {
    try {
        const patientId = req.params.patientId;
        const logs = db.prepare(`
            SELECT ml.*, pm.medicine_name, mr.routine_date, mr.routine_time
            FROM medicine_logs ml
            JOIN medicine_routines mr ON ml.routine_id = mr.id
            JOIN prescription_medicines pm ON mr.medicine_id = pm.id
            WHERE ml.patient_id = ?
            ORDER BY ml.taken_at DESC
        `).all(patientId);

        return res.json({ success: true, data: logs });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPatientMedicineRoutine,
    markMedicineTaken,
    getMedicineLogs
};
