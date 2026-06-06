const db = require('../config/db');
const { getAvailableSlots } = require('../services/slot.service');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const getAllDoctors = (req, res, next) => {
    try {
        const doctors = db.prepare("SELECT * FROM doctors WHERE status = 'active'").all();
        // Parse JSON lists for available_days
        doctors.forEach(doc => {
            try {
                doc.available_days = JSON.parse(doc.available_days);
            } catch (e) {
                doc.available_days = [];
            }
        });
        return res.json({ success: true, data: doctors });
    } catch (err) {
        next(err);
    }
};

const getDoctorById = (req, res, next) => {
    try {
        const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }
        try {
            doctor.available_days = JSON.parse(doctor.available_days);
        } catch (e) {
            doctor.available_days = [];
        }
        return res.json({ success: true, data: doctor });
    } catch (err) {
        next(err);
    }
};

const createDoctor = async (req, res, next) => {
    try {
        const { name, specialization, experience, fee, phone, email, availableDays, slotStartTime, slotEndTime, maxPatientsPerSlot, password, avatarUrl } = req.body;
        
        if (!name || !specialization || !experience || !fee || !phone || !email || !availableDays || !slotStartTime || !slotEndTime || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields, including login password for the doctor.' });
        }

        // Check if email already exists in doctors or patients
        const existingDoc = db.prepare("SELECT * FROM doctors WHERE email = ?").get(email);
        if (existingDoc) {
            return res.status(400).json({ success: false, message: 'Doctor with this email already exists.' });
        }

        const doctorId = uuidv4();
        const availableDaysJSON = JSON.stringify(availableDays); // expected array: ["Monday", "Tuesday", ...]

        // 1. Insert into doctors table
        db.prepare(`
            INSERT INTO doctors (id, name, specialization, experience, fee, phone, email, available_days, slot_start_time, slot_end_time, max_patients_per_slot, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            doctorId, name, specialization, Number(experience), Number(fee), phone, email, 
            availableDaysJSON, slotStartTime, slotEndTime, Number(maxPatientsPerSlot || 10), avatarUrl || null
        );

        // 2. Create doctor login credentials in doctor_users table
        const doctorUserId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare(`
            INSERT INTO doctor_users (id, doctor_id, email, password)
            VALUES (?, ?, ?, ?)
        `).run(doctorUserId, doctorId, email, hashedPassword);

        const newDoctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctorId);
        newDoctor.available_days = JSON.parse(newDoctor.available_days);

        return res.status(201).json({
            success: true,
            message: 'Doctor created successfully with active credentials.',
            data: newDoctor
        });
    } catch (err) {
        next(err);
    }
};

const updateDoctor = (req, res, next) => {
    try {
        const { name, specialization, experience, fee, phone, email, availableDays, slotStartTime, slotEndTime, maxPatientsPerSlot, status, avatarUrl } = req.body;
        const doctorId = req.params.id;

        const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        const availableDaysJSON = availableDays ? JSON.stringify(availableDays) : doctor.available_days;

        db.prepare(`
            UPDATE doctors 
            SET name = ?, specialization = ?, experience = ?, fee = ?, phone = ?, email = ?, 
                available_days = ?, slot_start_time = ?, slot_end_time = ?, max_patients_per_slot = ?, status = ?, avatar_url = ?
            WHERE id = ?
        `).run(
            name || doctor.name,
            specialization || doctor.specialization,
            experience ? Number(experience) : doctor.experience,
            fee ? Number(fee) : doctor.fee,
            phone || doctor.phone,
            email || doctor.email,
            availableDaysJSON,
            slotStartTime || doctor.slot_start_time,
            slotEndTime || doctor.slot_end_time,
            maxPatientsPerSlot ? Number(maxPatientsPerSlot) : doctor.max_patients_per_slot,
            status || doctor.status,
            avatarUrl !== undefined ? avatarUrl : doctor.avatar_url,
            doctorId
        );

        // Also update doctor_user email if email changed
        if (email && email !== doctor.email) {
            db.prepare("UPDATE doctor_users SET email = ? WHERE doctor_id = ?").run(email, doctorId);
        }

        const updatedDoc = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctorId);
        updatedDoc.available_days = JSON.parse(updatedDoc.available_days);

        return res.json({
            success: true,
            message: 'Doctor details updated successfully.',
            data: updatedDoc
        });
    } catch (err) {
        next(err);
    }
};

const deleteDoctor = (req, res, next) => {
    try {
        const doctorId = req.params.id;
        const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        // Soft delete - set status to inactive
        db.prepare("UPDATE doctors SET status = 'inactive' WHERE id = ?").run(doctorId);

        return res.json({
            success: true,
            message: 'Doctor deactivated successfully.'
        });
    } catch (err) {
        next(err);
    }
};

const getSlotsForDoctor = (req, res, next) => {
    try {
        const doctorId = req.params.id;
        const { date } = req.query; // Expects YYYY-MM-DD
        
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required.' });
        }

        const availability = getAvailableSlots(doctorId, date);
        return res.json({
            success: true,
            data: availability
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getSlotsForDoctor
};
