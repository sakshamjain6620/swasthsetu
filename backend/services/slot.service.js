const db = require('../config/db');

/**
 * Parses time string (e.g. "09:30") into minutes from midnight
 */
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight into HH:MM string
 */
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Gets day of week name from date string (YYYY-MM-DD)
 */
function getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Generates slots of 30-minute intervals
 */
function generateTimeSlots(startStr, endStr, intervalMinutes = 30) {
    const slots = [];
    const startMinutes = timeToMinutes(startStr);
    const endMinutes = timeToMinutes(endStr);
    
    for (let m = startMinutes; m < endMinutes; m += intervalMinutes) {
        slots.push(minutesToTime(m));
    }
    return slots;
}

/**
 * Check slots availability for a doctor on a specific date
 */
const getAvailableSlots = (doctorId, dateStr) => {
    // 1. Get Doctor details
    const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctorId);
    if (!doctor) {
        throw new Error('Doctor not found');
    }

    if (doctor.status !== 'active') {
        return { isAvailable: false, reason: 'Doctor is currently inactive', slots: [] };
    }

    // 2. Validate day of week
    const targetDay = getDayName(dateStr);
    let availableDays = [];
    try {
        availableDays = JSON.parse(doctor.available_days);
    } catch (e) {
        availableDays = [];
    }

    if (!availableDays.includes(targetDay)) {
        return { isAvailable: false, reason: `Doctor does not consult on ${targetDay}s`, slots: [] };
    }

    // 3. Generate slots
    const slotTimes = generateTimeSlots(doctor.slot_start_time, doctor.slot_end_time);

    // 4. Query confirmed appointments for this doctor on this date
    // Note: User rule: Slot count reduces ONLY after successful payment confirmation (confirmed/paid)
    const appointments = db.prepare(`
        SELECT appointment_time, COUNT(*) as count 
        FROM appointments 
        WHERE doctor_id = ? 
          AND appointment_date = ? 
          AND (appointment_status = 'confirmed' OR payment_status = 'paid')
        GROUP BY appointment_time
    `).all(doctorId, dateStr);

    const bookingMap = {};
    appointments.forEach(app => {
        bookingMap[app.appointment_time] = app.count;
    });

    // 5. Calculate available capacity for each slot
    const maxCapacity = doctor.max_patients_per_slot || 10;
    const slots = slotTimes.map(time => {
        const booked = bookingMap[time] || 0;
        const available = Math.max(0, maxCapacity - booked);
        return {
            time,
            capacity: maxCapacity,
            booked,
            available,
            isFull: available === 0
        };
    });

    return {
        isAvailable: true,
        date: dateStr,
        day: targetDay,
        slots
    };
};

module.exports = {
    getAvailableSlots
};
