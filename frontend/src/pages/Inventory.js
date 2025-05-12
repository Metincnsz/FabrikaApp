import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import RealTimeInventory from '../components/RealTimeInventory';
import socketService from '../services/socketService';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    minQuantity: '',
    unit: '',
    location: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventory(response.data);
    } catch (error) {
      showSnackbar('Stok bilgileri yüklenirken hata oluştu', 'error');
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        unit: item.unit,
        location: item.location
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
        quantity: '',
        minQuantity: '',
        unit: '',
        location: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        const response = await axios.put(`http://localhost:5000/api/inventory/${selectedItem._id}`, formData);
        showSnackbar('Stok başarıyla güncellendi');
        
        // WebSocket ile güncellenmiş veriyi gönder
        socketService.emit('inventory_update', response.data);
      } else {
        const response = await axios.post('http://localhost:5000/api/inventory', formData);
        showSnackbar('Yeni stok başarıyla eklendi');
        
        // WebSocket ile yeni veriyi gönder
        socketService.emit('inventory_update', response.data);
      }
      handleCloseDialog();
      fetchInventory();
    } catch (error) {
      showSnackbar('İşlem sırasında bir hata oluştu', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu stok kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/inventory/${id}`);
        showSnackbar('Stok başarıyla silindi');
        fetchInventory();
        
        // WebSocket ile silme bilgisini gönder
        socketService.emit('inventory_update', { id, deleted: true });
      } catch (error) {
        showSnackbar('Silme işlemi sırasında bir hata oluştu', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.minQuantity);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stok Özeti Kartları */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Toplam Ürün Çeşidi
              </Typography>
              <Typography variant="h4">
                {inventory.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Toplam Stok Miktarı
              </Typography>
              <Typography variant="h4">
                {inventory.reduce((sum, item) => sum + item.quantity, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kritik Stok Seviyesi
              </Typography>
              <Typography variant="h4" color="error">
                {getLowStockItems().length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Stok Listesi */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Stok Listesi</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Yeni Stok Ekle
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün Adı</TableCell>
                    <TableCell>Miktar</TableCell>
                    <TableCell>Birim</TableCell>
                    <TableCell>Minimum Miktar</TableCell>
                    <TableCell>Konum</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Typography
                          color={item.quantity <= item.minQuantity ? 'error' : 'inherit'}
                        >
                          {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.minQuantity}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Gerçek Zamanlı Stok Takibi */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Gerçek Zamanlı Stok Aktivitesi
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <RealTimeInventory initialItems={inventory} />
          </Paper>
        </Grid>
      </Grid>

      {/* Stok Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Stok Düzenle' : 'Yeni Stok Ekle'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Ürün Adı"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Miktar"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Minimum Miktar"
              name="minQuantity"
              type="number"
              value={formData.minQuantity}
              onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Birim"
              name="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Konum"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button type="submit" variant="contained">
              {selectedItem ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Inventory; 