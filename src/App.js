import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, CssBaseline, Box, Paper, Snackbar, Alert, IconButton, Typography } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import InputSection from './components/InputSection';
import RecommendationDisplay from './components/RecommendationDisplay';
import './App.css';

function App() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('dark');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#4caf50' : '#2e7d32',
          },
          secondary: {
            main: mode === 'dark' ? '#a1887f' : '#795548',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
        components: {
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                },
              },
            },
          },
        },
      }),
    [mode],
  );

  const handleSubmission = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll simulate an API call with mock data
      // This will be replaced with actual API call later
      setTimeout(() => {
        const mockRecommendation = {
          primaryMethod: "Conservation Tillage",
          estimatedCost: 45.50,
          benefits: [
            "Reduces soil erosion by 60%",
            "Improves soil moisture retention",
            "Decreases fuel consumption",
            "Maintains soil organic matter"
          ],
          factors: [
            "Soil Type: Clay Loam",
            "Previous Crop: Corn",
            "Slope: 2-4%",
            "Rainfall: Moderate"
          ],
          alternativeOptions: [
            {
              method: "No-Till System",
              cost: 35.75
            },
            {
              method: "Strip Tillage",
              cost: 52.25
            }
          ],
          explanation: "Based on your field conditions, Conservation Tillage is recommended as it provides the best balance between soil conservation and crop establishment. The clay loam soil type will benefit from reduced compaction, while the moderate slope makes erosion control crucial."
        };

        setRecommendation(mockRecommendation);
        setLoading(false);
      }, 2000);

    } catch (err) {
      setError("Failed to get recommendations. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4, position: 'relative' }}>
          <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
            <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} color="inherit">
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            IntillaSense
          </Typography>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <InputSection onSubmit={handleSubmission} loading={loading} />
          </Paper>
          {recommendation && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <RecommendationDisplay recommendation={recommendation} />
            </Paper>
          )}
        </Box>
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
