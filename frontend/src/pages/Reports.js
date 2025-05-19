import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const Reports = () => {
    const [reportType, setReportType] = useState('production');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/reports/generate', {
                reportType,
                startDate,
                endDate
            });
            setReportData(response.data.data);
        } catch (error) {
            console.error('Rapor oluşturma hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMetrics = () => {
        if (!reportData?.metrics) return null;

        return (
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {Object.entries(reportData.metrics).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </Typography>
                            <Typography variant="h4">
                                {typeof value === 'number' ? value.toFixed(2) : value}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        );
    };

    const renderChart = () => {
        if (!reportData?.details) return null;

        return (
            <Paper sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Detaylı Analiz
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={reportData.details}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Raporlar ve Analizler
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Rapor Tipi</InputLabel>
                            <Select
                                value={reportType}
                                label="Rapor Tipi"
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <MenuItem value="production">Üretim Raporu</MenuItem>
                                <MenuItem value="inventory">Envanter Raporu</MenuItem>
                                <MenuItem value="performance">Performans Raporu</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Başlangıç Tarihi"
                                value={startDate}
                                onChange={setStartDate}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Bitiş Tarihi"
                                value={endDate}
                                onChange={setEndDate}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={generateReport}
                            disabled={loading}
                        >
                            {loading ? 'Oluşturuluyor...' : 'Rapor Oluştur'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {reportData && (
                <>
                    {renderMetrics()}
                    {renderChart()}
                </>
            )}
        </Container>
    );
};

export default Reports; 