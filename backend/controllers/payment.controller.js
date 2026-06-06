const db = require('../config/db');
const { createOrder, verifySignature } = require('../services/razorpay.service');
const { sendAppointmentReminder } = require('../services/reminder.service');
const { v4: uuidv4 } = require('uuid');

const generatePaymentOrder = async (req, res, next) => {
    try {
        const { appointmentId } = req.body;
        if (!appointmentId) {
            return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
        }

        const appointment = db.prepare("SELECT * FROM appointments WHERE id = ?").get(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        // Create Razorpay Order
        const amountInRupees = appointment.amount;
        const rpOrder = await createOrder(amountInRupees, appointmentId);

        // Save Payment record
        const paymentId = uuidv4();
        db.prepare(`
            INSERT INTO payments (id, appointment_id, patient_id, amount, currency, razorpay_order_id, payment_status)
            VALUES (?, ?, ?, ?, 'INR', ?, 'pending')
        `).run(paymentId, appointmentId, appointment.patient_id, amountInRupees, rpOrder.id);

        // Update appointment with Razorpay Order ID
        db.prepare("UPDATE appointments SET razorpay_order_id = ? WHERE id = ?").run(rpOrder.id, appointmentId);

        return res.json({
            success: true,
            message: 'Razorpay order created successfully.',
            data: {
                key: process.env.RAZORPAY_KEY_ID || 'rzp_test_SxyTETXvDZEo7l',
                amount: rpOrder.amount,
                currency: rpOrder.currency,
                order_id: rpOrder.id,
                appointment_id: appointmentId
            }
        });
    } catch (err) {
        next(err);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !appointmentId) {
            return res.status(400).json({ success: false, message: 'All signature verification fields are required.' });
        }

        const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (isValid) {
            // Update Payments Table
            db.prepare(`
                UPDATE payments 
                SET payment_status = 'paid', razorpay_payment_id = ?, razorpay_signature = ? 
                WHERE razorpay_order_id = ?
            `).run(razorpay_payment_id, razorpay_signature, razorpay_order_id);

            // Update Appointments Table
            db.prepare(`
                UPDATE appointments 
                SET payment_status = 'paid', appointment_status = 'confirmed', razorpay_payment_id = ? 
                WHERE id = ?
            `).run(razorpay_payment_id, appointmentId);

            // Retrieve updated appointment, patient and doctor details
            const appointment = db.prepare("SELECT * FROM appointments WHERE id = ?").get(appointmentId);
            const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(appointment.patient_id);
            const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(appointment.doctor_id);

            // Send Appointment reminder on WhatsApp and Email
            sendAppointmentReminder(appointment, patient, doctor);

            return res.json({
                success: true,
                message: 'Payment verified and appointment confirmed.',
                data: {
                    appointmentId,
                    tokenNo: appointment.token_no,
                    paymentId: razorpay_payment_id
                }
            });
        } else {
            // Update payments table to failed
            db.prepare("UPDATE payments SET payment_status = 'failed' WHERE razorpay_order_id = ?").run(razorpay_order_id);
            db.prepare("UPDATE appointments SET payment_status = 'failed', appointment_status = 'cancelled' WHERE id = ?").run(appointmentId);

            return res.status(400).json({
                success: false,
                message: 'Payment signature verification failed. Transaction marked as failed.'
            });
        }
    } catch (err) {
        next(err);
    }
};

const getPaymentByAppointmentId = (req, res, next) => {
    try {
        const payment = db.prepare("SELECT * FROM payments WHERE appointment_id = ?").get(req.params.appointmentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found.' });
        }
        return res.json({ success: true, data: payment });
    } catch (err) {
        next(err);
    }
};

const getAllPayments = (req, res, next) => {
    try {
        const payments = db.prepare(`
            SELECT pay.*, p.name as patient_name, d.name as doctor_name 
            FROM payments pay
            JOIN patients p ON pay.patient_id = p.id
            JOIN appointments a ON pay.appointment_id = a.id
            JOIN doctors d ON a.doctor_id = d.id
            ORDER BY pay.created_at DESC
        `).all();
        return res.json({ success: true, data: payments });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    generatePaymentOrder,
    verifyPayment,
    getPaymentByAppointmentId,
    getAllPayments
};
