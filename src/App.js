import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Container, 
  CssBaseline, 
  Box, 
  Paper, 
  Snackbar, 
  Alert, 
  IconButton, 
  Typography,
  Button,
  Fade,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { 
  Brightness4, 
  Brightness7, 
  Search,
  KeyboardArrowUp,
  Agriculture
} from '@mui/icons-material';
import InputSection from './components/InputSection';
import RecommendationDisplay from './components/RecommendationDisplay';
import './App.css';

function App() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'light');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(1); // Default to Farm 1

  // Handle scroll to show/hide scroll to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFarmChange = (event, newFarm) => {
    if (newFarm !== null) {
      setSelectedFarm(newFarm);
    }
  };

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };

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
            default: mode === 'dark' ? '#121212' : '#ffffff',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
        components: {
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '100px',
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  '& fieldset': {
                    borderColor: 'transparent',
                    borderRadius: '100px',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '100px',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '100px',
                  },
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
        shape: {
          borderRadius: 20,
        },
      }),
    [mode],
  );

  const handleSubmission = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      // Add the selected farm to the form data
      formData.append('farmNum', selectedFarm);

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
      <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header with IntillaSense logo and theme toggle */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 8
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              background: mode === 'dark' 
                ? 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)'
                : 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            IntillaSense
          </Typography>
          <IconButton 
            onClick={toggleTheme} 
            sx={{ 
              color: theme.palette.text.primary,
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}>
          {/* Main title section */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                mb: 2
              }}
            >
              What can I help with?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Get smart tillage recommendations for your field
            </Typography>
          </Box>

          {/* Farm selection */}
          <ToggleButtonGroup
            value={selectedFarm}
            exclusive
            onChange={handleFarmChange}
            aria-label="farm selection"
            sx={{
              mb: -2,
              '& .MuiToggleButton-root': {
                borderRadius: '100px',
                px: 3,
                py: 1,
                mx: 1,
                border: 'none',
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                },
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                }
              }
            }}
          >
            <ToggleButton value={1}>
              <Agriculture sx={{ mr: 1 }} />
              Illinois Farm
            </ToggleButton>
            <ToggleButton value={2}>
              <Agriculture sx={{ mr: 1 }} />
              North Dakota Farm
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Main input section with action buttons */}
          <Box sx={{ width: '100%', maxWidth: '1000px', mx: 'auto' }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 0,
                backgroundColor: 'transparent'
              }}
            >
              <InputSection onSubmit={handleSubmission} loading={loading} />
            </Paper>
          </Box>

          {/* Recommendations display */}
          {recommendation && (
            <Fade in={true}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4,
                  width: '100%',
                  maxWidth: '1000px',
                  mx: 'auto',
                  backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <RecommendationDisplay recommendation={recommendation} />
              </Paper>
            </Fade>
          )}
        </Box>

        {/* Scroll to top button */}
        <Fade in={showScrollTop}>
          <IconButton
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            <KeyboardArrowUp />
          </IconButton>
        </Fade>

        {/* Error snackbar */}
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
