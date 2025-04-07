const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: [true, 'Lütfen üretim parti numarası giriniz'],
    unique: true,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Lütfen üretim miktarını giriniz'],
    min: [1, 'Üretim miktarı en az 1 olmalıdır']
  },
  status: {
    type: String,
    enum: ['planlandı', 'üretimde', 'tamamlandı', 'iptal edildi', 'durduruldu'],
    default: 'planlandı'
  },
  startDate: {
    type: Date,
    required: [true, 'Lütfen başlangıç tarihini giriniz']
  },
  endDate: {
    type: Date,
    required: false
  },
  estimatedEndDate: {
    type: Date,
    required: [true, 'Lütfen tahmini bitiş tarihini giriniz']
  },
  machineGroup: {
    type: String,
    required: [true, 'Lütfen üretim makinesi grubunu giriniz'],
    enum: ['dokuma', 'boya', 'dikim', 'kesim', 'paketleme', 'diğer']
  },
  rawMaterials: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    unit: String
  }],
  notes: String,
  qualityCheck: {
    isPassed: {
      type: Boolean,
      default: null
    },
    defectRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkDate: Date,
    notes: String
  },
  responsiblePersons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Güncelleme zamanını otomatik güncelle
productionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Tamamlandı olarak işaretlendiğinde endDate'i otomatik güncelle
productionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'tamamlandı' && !this.endDate) {
    this.endDate = Date.now();
  }
  next();
});

module.exports = mongoose.model('Production', productionSchema);