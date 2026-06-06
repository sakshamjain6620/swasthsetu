const Razorpay = require('razorpay');
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SxyTETXvDZEo7l',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'Vx2CQK8NSd7k8wXF7NxrZMlf'
});

module.exports = razorpay;
