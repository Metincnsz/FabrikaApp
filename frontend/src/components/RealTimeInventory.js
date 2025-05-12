import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert,
  Snackbar
} from '@mui/material';
import socketService from '../services/socketService';

const RealTimeInventory = ({ initialItems = [] }) => {
  const [items, setItems] = useState(initialItems);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // WebSocket üzerinden stok güncellemelerini dinle
    const handleInventoryUpdate = (updatedItem) => {
      setItems(prevItems => {
        const itemIndex = prevItems.findIndex(item => item.id === updatedItem.id);
        
        if (itemIndex !== -1) {
          // Mevcut öğeyi güncelle
          const updatedItems = [...prevItems];
          updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updatedItem };
          
          // Bildirim göster
          setNotification({
            message: `${updatedItem.name} stoğu güncellendi: ${updatedItem.quantity} adet`,
            type: 'info'
          });
          
          return updatedItems;
        } else {
          // Yeni öğe ekle
          setNotification({
            message: `Yeni ürün eklendi: ${updatedItem.name}`,
            type: 'success'
          });
          
          return [...prevItems, updatedItem];
        }
      });
    };

    // Socket.io olayını dinle
    socketService.on('inventory_updated', handleInventoryUpdate);

    // Temizleme fonksiyonu
    return () => {
      socketService.off('inventory_updated', handleInventoryUpdate);
    };
  }, []);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Gerçek Zamanlı Stok Takibi
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ürün Adı</TableCell>
              <TableCell>Miktar</TableCell>
              <TableCell>Birim</TableCell>
              <TableCell>Son Güncelleme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{new Date(item.updatedAt).toLocaleString('tr-TR')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Henüz stok verisi yok
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bildirim */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification && (
          <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default RealTimeInventory; 