import React, { useState, useMemo, useCallback } from 'react';
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
  ToggleButton,
  CircularProgress
} from '@mui/material';
import { 
  Brightness4, 
  Brightness7, 
  Search,
  KeyboardArrowUp,
  Agriculture,
  Image as ImageIcon
} from '@mui/icons-material';
import InputSection from './components/InputSection';
import RecommendationDisplay from './components/RecommendationDisplay';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'light');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(1); // Default to Farm 1
  const [imageFile, setImageFile] = useState(null);
  const [validationError, setValidationError] = useState(null);

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

      // Make the API request to /user_chatbot_request
      const text = formData.get('text') || '';
      const queryParams = new URLSearchParams({
        farmNum: selectedFarm,
        text: text
      });
      
      try {
        const response = await fetch(`/user_chatbot_request?${queryParams}`);
        const data = await response.json();
        console.log('Chatbot Response:', data);

        const mockRecommendation = {
          responseToUser: data.response_to_user_question,
          primaryMethod: data.primary_option.equipment,
          estimatedCost: data.primary_option.estimated_total_cost,
          benefits: data.benefits,
          factors: [
            `Soil Type: ${data.field_specific_factors.soil_type}`,
            `Rainfall Trend: ${data.field_specific_factors.rainfall_trend === 2 ? 'Steady' : data.field_specific_factors.rainfall_trend === 1 ? 'Increasing' : 'Decreasing'}`,
          ],
          alternativeOptions: [
            {
              method: data.alternative_option_1.equipment,
              cost: data.alternative_option_1.estimated_total_cost
            },
            {
              method: data.alternative_option_2.equipment,
              cost: data.alternative_option_2.estimated_total_cost
            }
          ],
          explanation: data.summary_info_blurb
        };

        setRecommendation(mockRecommendation);
        setLoading(false);
      } catch (error) {
        console.error('API Request Error:', error);
        setError("Failed to get recommendations. Please try again.");
        setLoading(false);
      }

    } catch (err) {
      setError("Failed to get recommendations. Please try again.");
      setLoading(false);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    noClick: true,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles[0]?.errors[0]?.code === 'file-too-large') {
        setError('File size must be less than 5MB');
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box {...getRootProps()} sx={{ minHeight: '100vh' }}>
        <input {...getInputProps()} />
        {isDragActive && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              pointerEvents: 'none'
            }}
          >
            <ImageIcon sx={{ fontSize: 64, color: '#fff' }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#fff', mb: 1 }}>
                Drop your field image here
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Maximum file size: 5MB
              </Typography>
            </Box>
          </Box>
        )}
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
                <InputSection 
                  onSubmit={handleSubmission} 
                  loading={loading} 
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                />
              </Paper>
            </Box>

            {/* Recommendations display */}
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 2,
                mt: 4
              }}>
                <CircularProgress 
                  size={60}
                  thickness={4}
                  sx={{ 
                    color: theme.palette.primary.main
                  }}
                />
                <Typography variant="body1" color="text.secondary">
                  Analyzing your request...
                </Typography>
              </Box>
            ) : recommendation && (
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
      </Box>
    </ThemeProvider>
  );
}

export default App;
