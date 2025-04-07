const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  warehouse: {
    type: String,
    required: [true, 'Lütfen depo bilgisi giriniz'],
    enum: ['ana depo', 'üretim depo', 'hammadde depo', 'sevkiyat depo']
  },
  location: {
    section: String,
    shelf: String,
    bin: String
  },
  quantity: {
    type: Number,
    required: [true, 'Lütfen miktar giriniz'],
    min: 0
  },
  unit: {
    type: String,
    required: [true, 'Lütfen birim giriniz'],
    enum: ['adet', 'kg', 'metre', 'top', 'paket']
  },
  status: {
    type: String,
    enum: ['kullanılabilir', 'rezerve', 'kusurlu', 'karantina'],
    default: 'kullanılabilir'
  },
  batchNumber: {
    type: String,
    required: false
  },
  expiryDate: {
    type: Date,
    required: false
  },
  notes: String,
  lastInventoryCount: {
    date: Date,
    quantity: Number,
    countedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  transactions: [{
    type: {
      type: String,
      enum: ['giriş', 'çıkış', 'transfer', 'ayarlama'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    reference: {
      type: String,
      required: false
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
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
inventorySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// İşlem eklendiğinde ürün stoğunu güncelle
inventorySchema.pre('save', async function(next) {
  try {
    if (this.isModified('transactions')) {
      const lastTransaction = this.transactions[this.transactions.length - 1];
      const Product = mongoose.model('Product');
      
      if (lastTransaction) {
        const product = await Product.findById(this.product);
        
        if (product) {
          let stockChange = lastTransaction.quantity;
          
          if (lastTransaction.type === 'çıkış' || lastTransaction.type === 'transfer') {
            stockChange = -stockChange;
          }
          
          await Product.findByIdAndUpdate(this.product, {
            $inc: { stock: stockChange }
          });
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);