import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Factory as FactoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
    } else {
      setUser(userData);
    }
  }, [navigate]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/api/auth/logout', {
        withCredentials: true
      });
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  const menuItems = [
    { icon: <PersonIcon />, text: 'Profil', action: () => {} },
    { icon: <SettingsIcon />, text: 'Ayarlar', action: () => {} },
    { icon: <LogoutIcon />, text: 'Çıkış Yap', action: handleLogout }
  ];

  const navigationItems = [
    { icon: <DashboardIcon />, text: 'Dashboard', path: '/dashboard' },
    { icon: <InventoryIcon />, text: 'Stok Yönetimi', path: '/inventory' },
    { icon: <FactoryIcon />, text: 'Üretim', path: '/production' },
    { icon: <PeopleIcon />, text: 'Kullanıcılar', path: '/users' }
  ];

  const stats = [
    { title: 'Toplam Kullanıcı', value: '24', icon: <PeopleIcon />, color: '#1976d2' },
    { title: 'Aktif Üretim', value: '8', icon: <FactoryIcon />, color: '#2e7d32' },
    { title: 'Stok Ürün', value: '156', icon: <InventoryIcon />, color: '#ed6c02' },
    { title: 'Günlük Üretim', value: '1,234', icon: <DashboardIcon />, color: '#9c27b0' }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 240,
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          borderRadius: 0,
          bgcolor: 'primary.main',
          color: 'white'
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">FabrikaApp</Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Hoş Geldiniz
          </Typography>
          <Typography variant="h6">{user?.name}</Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <Box sx={{ mt: 2 }}>
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              fullWidth
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                justifyContent: 'flex-start',
                px: 3,
                py: 1.5,
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, ml: 30, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <IconButton onClick={handleMenuOpen}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {menuItems.map((item, index) => (
              <MenuItem key={index} onClick={() => {
                item.action();
                handleMenuClose();
              }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.text}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: stat.color,
                        color: 'white',
                        p: 1,
                        borderRadius: '50%',
                        mr: 2
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h6">{stat.title}</Typography>
                  </Box>
                  <Typography variant="h4">{stat.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activities */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Son Üretimler" />
              <CardContent>
                {/* Üretim listesi buraya gelecek */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Stok Uyarıları" />
              <CardContent>
                {/* Stok uyarıları buraya gelecek */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard; 