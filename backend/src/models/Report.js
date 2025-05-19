const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        required: true,
        enum: ['production', 'inventory', 'sales', 'performance']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    metrics: {
        totalProduction: Number,
        totalInventory: Number,
        totalSales: Number,
        efficiency: Number,
        wastePercentage: Number,
        machineUtilization: Number
    },
    details: [{
        date: Date,
        value: Number,
        category: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema); 