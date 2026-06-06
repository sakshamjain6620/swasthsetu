const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const paymentRoutes = require('./routes/payment.routes');
const aiRoutes = require('./routes/ai.routes');
const patientRoutes = require('./routes/patient.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const medicineRoutes = require('./routes/medicine.routes');
const reminderRoutes = require('./routes/reminder.routes');
const adminRoutes = require('./routes/admin.routes');

// Import middleware
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup - allow frontend requests
app.use(cors({
    origin: '*', // For development, allow all origins
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default status route
app.get('/api/status', (req, res) => {
    res.json({ 
        success: true, 
        message: 'SwasthSetu Backend API is running smoothly.', 
        timestamp: new Date() 
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin', adminRoutes);

// 404 & Error Handler
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 SwasthSetu Server started on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`==================================================`);
});
