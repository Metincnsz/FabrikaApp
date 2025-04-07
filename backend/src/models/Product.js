const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lütfen ürün adı giriniz'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Lütfen ürün kodu giriniz'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Lütfen ürün kategorisi giriniz'],
    enum: ['kumaş', 'tekstil', 'aksesuar', 'iplik', 'diğer']
  },
  description: {
    type: String,
    required: false
  },
  specifications: {
    material: String,
    color: String,
    weight: Number,
    dimensions: {
      width: Number,
      length: Number,
      height: Number,
      unit: {
        type: String,
        default: 'cm'
      }
    }
  },
  unitPrice: {
    type: Number,
    required: [true, 'Lütfen birim fiyat giriniz']
  },
  stock: {
    type: Number,
    default: 0
  },
  minStockLevel: {
    type: Number,
    default: 10
  },
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  },
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
productSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Product', productSchema); 