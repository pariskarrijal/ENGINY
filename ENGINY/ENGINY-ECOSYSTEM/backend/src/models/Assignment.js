const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' },
    status: { type: String, enum: ['ASSIGNED', 'REJECTED'], required: true },
    score: Number,
    reason: String,
    processedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);