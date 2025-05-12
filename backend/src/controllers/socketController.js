const Inventory = require('../models/Inventory');

/**
 * WebSocket bağlantılarını yönetir ve olayları işler
 * @param {Object} io - Socket.io sunucu instance'ı
 */
const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Yeni bir kullanıcı bağlandı:', socket.id);
    
    // Stok güncellemelerini dinle
    socket.on('inventory_update', async (data) => {
      try {
        console.log('Stok güncelleme isteği alındı:', data);
        
        // Silme işlemi ise
        if (data.deleted) {
          // Tüm bağlı istemcilere silme bilgisini gönder
          io.emit('inventory_updated', { id: data.id, deleted: true });
          return;
        }
        
        // Veritabanında kaydı güncelle veya oluştur
        let inventoryItem;
        
        if (data._id) {
          // Mevcut kaydı güncelle
          inventoryItem = await Inventory.findByIdAndUpdate(
            data._id,
            { ...data },
            { new: true }
          );
        } else {
          // Yeni kayıt oluştur
          inventoryItem = new Inventory(data);
          await inventoryItem.save();
        }
        
        // Tüm bağlı istemcilere güncel veriyi gönder
        io.emit('inventory_updated', inventoryItem);
      } catch (error) {
        console.error('Stok güncelleme hatası:', error);
        // Hata durumunda sadece ilgili istemciye hata bilgisi gönder
        socket.emit('error', { message: 'Stok güncellenirken bir hata oluştu' });
      }
    });
    
    // Üretim güncellemelerini dinle
    socket.on('production_update', async (data) => {
      try {
        console.log('Üretim güncelleme isteği alındı:', data);
        
        // Üretim verisini işle (örnek)
        // const productionData = await Production.findByIdAndUpdate(data._id, data, { new: true });
        
        // Tüm bağlı istemcilere güncel veriyi gönder
        io.emit('production_updated', data);
      } catch (error) {
        console.error('Üretim güncelleme hatası:', error);
        socket.emit('error', { message: 'Üretim güncellenirken bir hata oluştu' });
      }
    });
    
    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
      console.log('Kullanıcı bağlantısı kesildi:', socket.id);
    });
  });
};

module.exports = { setupSocketHandlers }; 