const { analyzeSymptoms, generatePatientSummary } = require('../services/foundry.service');
const db = require('../config/db');

const processAIChat = async (req, res, next) => {
    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message field is required.' });
        }

        // 1. Send patient input to AI Foundry Service
        const aiAnalysis = await analyzeSymptoms(message);
        
        // 2. Fetch doctors matching the recommended specialization
        const matchingDoctors = db.prepare(`
            SELECT id, name, specialization, experience, fee, available_days, slot_start_time, slot_end_time, avatar_url
            FROM doctors
            WHERE specialization = ? AND status = 'active'
        `).all(aiAnalysis.specialization);

        matchingDoctors.forEach(doc => {
            try {
                doc.available_days = JSON.parse(doc.available_days);
            } catch (e) {
                doc.available_days = [];
            }
        });

        // 3. Format the AI chat assistant's response text
        let replyText = `I understand you are feeling symptoms related to **${aiAnalysis.specialization}**. Based on symptom analysis, I've classified the urgency level as **${aiAnalysis.urgency.toUpperCase()}**. \n\n_${aiAnalysis.recommendedReason}_\n\n`;
        
        if (matchingDoctors.length > 0) {
            replyText += `I recommend scheduling a consultation with one of our specialists. Here are our available doctors for **${aiAnalysis.specialization}**:\n`;
            matchingDoctors.forEach(doc => {
                replyText += `- **Dr. ${doc.name}** (${doc.experience} years exp, Consultation Fee: ₹${doc.fee})\n`;
            });
            replyText += `\nPlease select a doctor from the list below to view their available slots and book your appointment.`;
        } else {
            replyText += `We currently don't have active doctors listed for this specific specialization, but you can consult with our General Physician to get started.`;
        }

        // Provide conversational hints to frontend booking state machine
        return res.json({
            success: true,
            data: {
                message: replyText,
                specialization: aiAnalysis.specialization,
                urgency: aiAnalysis.urgency,
                recommendedDoctors: matchingDoctors,
                followUpQuestions: aiAnalysis.followUps,
                aiSummary: aiAnalysis.aiSummary,
                actionHint: matchingDoctors.length > 0 ? 'select_doctor' : 'chat_more'
            }
        });
    } catch (err) {
        next(err);
    }
};

const getPatientSymptomSummary = async (req, res, next) => {
    try {
        const { symptoms, diagnosis, doctorNotes } = req.body;
        if (!symptoms) {
            return res.status(400).json({ success: false, message: 'Symptoms field is required.' });
        }

        const summary = await generatePatientSummary(symptoms, diagnosis, doctorNotes);
        return res.json({
            success: true,
            data: { summary }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    processAIChat,
    getPatientSymptomSummary
};
