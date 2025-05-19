const Report = require('../models/Report');
const Production = require('../models/Production');
const Inventory = require('../models/Inventory');

exports.generateReport = async (req, res) => {
    try {
        const { reportType, startDate, endDate } = req.body;
        
        let reportData = {
            reportType,
            startDate,
            endDate,
            createdBy: req.user._id,
            metrics: {},
            details: []
        };

        // Rapor tipine göre veri toplama
        switch (reportType) {
            case 'production':
                const productionData = await Production.find({
                    date: { $gte: startDate, $lte: endDate }
                });
                
                reportData.metrics.totalProduction = productionData.reduce((sum, item) => sum + item.quantity, 0);
                reportData.metrics.efficiency = calculateEfficiency(productionData);
                
                // Günlük üretim detayları
                reportData.details = productionData.map(item => ({
                    date: item.date,
                    value: item.quantity,
                    category: item.productType
                }));
                break;

            case 'inventory':
                const inventoryData = await Inventory.find({
                    lastUpdated: { $gte: startDate, $lte: endDate }
                });
                
                reportData.metrics.totalInventory = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
                reportData.metrics.wastePercentage = calculateWastePercentage(inventoryData);
                
                // Envanter değişim detayları
                reportData.details = inventoryData.map(item => ({
                    date: item.lastUpdated,
                    value: item.quantity,
                    category: item.productName
                }));
                break;

            case 'performance':
                // Performans metriklerini hesapla
                const performanceData = await Production.find({
                    date: { $gte: startDate, $lte: endDate }
                });
                
                reportData.metrics.machineUtilization = calculateMachineUtilization(performanceData);
                reportData.metrics.efficiency = calculateEfficiency(performanceData);
                
                // Performans detayları
                reportData.details = performanceData.map(item => ({
                    date: item.date,
                    value: item.efficiency,
                    category: item.machineId
                }));
                break;
        }

        const report = new Report(reportData);
        await report.save();

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Yardımcı fonksiyonlar
function calculateEfficiency(productionData) {
    // Verimlilik hesaplama mantığı
    return 85; // Örnek değer
}

function calculateWastePercentage(inventoryData) {
    // Fire yüzdesi hesaplama mantığı
    return 5; // Örnek değer
}

function calculateMachineUtilization(performanceData) {
    // Makine kullanım oranı hesaplama mantığı
    return 75; // Örnek değer
} 