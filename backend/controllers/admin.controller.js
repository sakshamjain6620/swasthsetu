const db = require('../config/db');

const getDashboardStats = (req, res, next) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        const totalApps = db.prepare("SELECT COUNT(*) as count FROM appointments").get().count;
        const todayApps = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?").get(todayStr).count;
        const pendingPayments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE payment_status = 'pending'").get().count;
        const confirmedApps = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_status = 'confirmed'").get().count;
        const totalRevenue = db.prepare("SELECT SUM(amount) as sum FROM appointments WHERE payment_status = 'paid'").get().sum || 0;
        const activeDocs = db.prepare("SELECT COUNT(*) as count FROM doctors WHERE status = 'active'").get().count;
        const emergencyCases = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE urgency_level = 'emergency'").get().count;
        
        const activeReminders = db.prepare("SELECT COUNT(*) as count FROM reminders").get().count;

        return res.json({
            success: true,
            data: {
                totalAppointments: totalApps,
                todayAppointments: todayApps,
                pendingPayments,
                confirmedAppointments: confirmedApps,
                totalRevenue,
                activeDoctors: activeDocs,
                emergencyCases,
                medicineReminders: activeReminders
            }
        });
    } catch (err) {
        next(err);
    }
};

const getRevenueAnalytics = (req, res, next) => {
    try {
        // Get last 7 days of paid appointments revenue
        const dailyRev = db.prepare(`
            SELECT appointment_date as date, SUM(amount) as revenue
            FROM appointments
            WHERE payment_status = 'paid'
            GROUP BY appointment_date
            ORDER BY appointment_date DESC
            LIMIT 7
        `).all();

        return res.json({
            success: true,
            data: dailyRev.reverse()
        });
    } catch (err) {
        next(err);
    }
};

const getFilteredAppointments = (req, res, next) => {
    try {
        const { doctorId, date, paymentStatus, appointmentStatus } = req.query;
        let queryStr = `
            SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization, 
                   p.name as patient_name, p.phone as patient_phone
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN patients p ON a.patient_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (doctorId) {
            queryStr += " AND a.doctor_id = ?";
            params.push(doctorId);
        }
        if (date) {
            queryStr += " AND a.appointment_date = ?";
            params.push(date);
        }
        if (paymentStatus) {
            queryStr += " AND a.payment_status = ?";
            params.push(paymentStatus);
        }
        if (appointmentStatus) {
            queryStr += " AND a.appointment_status = ?";
            params.push(appointmentStatus);
        }

        queryStr += " ORDER BY a.appointment_date DESC, a.appointment_time DESC";

        const appointments = db.prepare(queryStr).all(...params);
        return res.json({ success: true, data: appointments });
    } catch (err) {
        next(err);
    }
};

const searchPatients = (req, res, next) => {
    try {
        const { search } = req.query;
        let queryStr = "SELECT id, name, age, gender, phone, email, address, created_at FROM patients";
        const params = [];

        if (search) {
            queryStr += " WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?";
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        queryStr += " ORDER BY name ASC";
        const patients = db.prepare(queryStr).all(...params);
        return res.json({ success: true, data: patients });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboardStats,
    getRevenueAnalytics,
    getFilteredAppointments,
    searchPatients
};
