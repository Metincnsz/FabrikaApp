const Inventory = require('../models/Inventory');

// Tüm stokları getir
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Stok bilgileri alınırken bir hata oluştu' });
  }
};

// Yeni stok ekle
exports.createInventory = async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ message: 'Stok eklenirken bir hata oluştu' });
  }
};

// Stok güncelle
exports.updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!inventory) {
      return res.status(404).json({ message: 'Stok bulunamadı' });
    }
    res.json(inventory);
  } catch (error) {
    res.status(400).json({ message: 'Stok güncellenirken bir hata oluştu' });
  }
};

// Stok sil
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Stok bulunamadı' });
    }
    res.json({ message: 'Stok başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Stok silinirken bir hata oluştu' });
  }
};

// Tek bir stok detayını getir
exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Stok bulunamadı' });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Stok bilgisi alınırken bir hata oluştu' });
  }
}; 