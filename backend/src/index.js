const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

// Çevre değişkenlerini yükle
dotenv.config();

// Veritabanı bağlantısı
connectDB();

// Express uygulaması
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Loglama
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route tanımlamaları burada gelecek
// app.use('/api/users', require('./routes/users'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/productions', require('./routes/productions'));
// app.use('/api/inventory', require('./routes/inventory'));

// Ana route
app.get('/', (req, res) => {
  res.json({ message: 'FabrikaApp API çalışıyor' });
});

// Hata yakalama middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Sunucu hatası'
  });
});

// Port tanımı
const PORT = process.env.PORT || 5000;

// Sunucu
app.listen(PORT, () => {
  console.log(`Sunucu ${process.env.NODE_ENV} modunda ${PORT} portunda çalışıyor`);
});