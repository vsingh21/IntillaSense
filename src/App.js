import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Image as ImageIcon,
  Close,
  ChevronRight,
  ChevronLeft
} from '@mui/icons-material';
import InputSection from './components/InputSection';
import RecommendationDisplay from './components/RecommendationDisplay';
import { useDropzone } from 'react-dropzone';
import ChatSidebar from './components/ChatSidebar';
import './App.css';

function App() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => 
    localStorage.getItem('sidebarCollapsed') !== 'false'
  );
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(1); // Default to Farm 1
  const [imageFile, setImageFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const chatBoxRef = React.useRef(null);
  const [chats, setChats] = useState(() => {
    try {
      const savedChats = localStorage.getItem('chats');
      if (!savedChats) return [];
      
      const parsedChats = JSON.parse(savedChats);
      return parsedChats.map(chat => ({
        ...chat,
        messages: chat.messages.map(msg => ({
          ...msg,
          // Convert base64 back to blob URL for images
          image: msg.image ? URL.createObjectURL(
            fetch(msg.image).then(res => res.blob())
          ) : null
        }))
      }));
    } catch (error) {
      console.error('Error loading chats:', error);
      return [];
    }
  });
  const [selectedChatId, setSelectedChatId] = useState(null);

  // Auto scroll to bottom when chat history changes
  React.useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle scroll to show/hide scroll to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle image paste
  React.useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
          }
          setImageFile(file);
          setError(null);
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // Save chats to localStorage with proper image handling
  useEffect(() => {
    const saveChats = async () => {
      try {
        // Process all chats and their messages
        const processedChats = await Promise.all(chats.map(async chat => {
          const processedMessages = await Promise.all(chat.messages.map(async msg => {
            // If message has a blob URL image, convert it to base64
            if (msg.image && msg.image.startsWith('blob:')) {
              const base64Image = await blobUrlToBase64(msg.image);
              return { ...msg, image: base64Image };
            }
            return msg;
          }));

          return {
            ...chat,
            messages: processedMessages
          };
        }));

        localStorage.setItem('chats', JSON.stringify(processedChats));
      } catch (error) {
        console.error('Error saving chats:', error);
      }
    };

    saveChats();
  }, [chats]);

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

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
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

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      timestamp: new Date().toISOString(),
      messages: []
    };
    setChats([newChat, ...chats]);
    setSelectedChatId(newChat.id);
    setChatHistory([]);
    setRecommendation(null);
  };

  const handleSelectChat = (chatId) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setSelectedChatId(chatId);
        setChatHistory(chat.messages);
        // Restore the last recommendation
        setRecommendation(chat.lastRecommendation || null);
      }
    } catch (error) {
      console.error('Error selecting chat:', error);
      setError('Failed to load chat. Please try again.');
    }
  };

  const handleDeleteChat = (chatId) => {
    setChats(chats.filter(c => c.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
      setChatHistory([]);
      setRecommendation(null);
    }
  };

  // Function to convert blob URL to base64
  const blobUrlToBase64 = async (blobUrl) => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to base64:', error);
      return null;
    }
  };

  const handleSubmission = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const text = formData.get('text') || '';
      
      // Convert image to base64 if present
      let imageBase64 = null;
      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      const userMessage = {
        type: 'user',
        content: text,
        image: imageBase64
      };

      // Create a new chat if none is selected
      if (!selectedChatId) {
        const newChat = {
          id: Date.now(),
          title: text || 'New Chat',
          timestamp: new Date().toISOString(),
          messages: [userMessage]
        };
        setChats(prevChats => [newChat, ...prevChats]);
        setSelectedChatId(newChat.id);
        setChatHistory([userMessage]);
      } else {
        // Update existing chat
        const newChatHistory = [...chatHistory, userMessage];
        setChatHistory(newChatHistory);
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === selectedChatId 
              ? { 
                  ...chat, 
                  messages: newChatHistory,
                  title: chat.messages.length === 0 ? text : chat.title
                }
              : chat
          )
        );
      }

      // Clear image file after adding to chat
      setImageFile(null);

      // Helper function to capitalize first letter of each word
      const capitalizeWords = (str) => {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      };

      try {
        // Get current chat history, either from existing chat or new message
        const currentChatHistory = selectedChatId 
          ? chats.find(c => c.id === selectedChatId)?.messages || []
          : [];

        const response = await fetch('/user_chatbot_request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            farmNum: selectedFarm,
            text: text,
            ...(imageBase64 && { image: imageBase64.split(',')[1] }),
            chat_history: [...currentChatHistory]
          })
        });
        
        const data = await response.json();
        console.log('Chatbot Response:', data);

        // Create recommendation object
        const recommendation = {
          responseToUser: data.response_to_user_question,
          primaryMethod: capitalizeWords(data.primary_tillage_option.equipment),
          estimatedCost: data.primary_tillage_option.total_cost_of_this_option,
          benefits: data.benefits_of_primary_tillage_option.map(benefit => benefit.charAt(0).toUpperCase() + benefit.slice(1)),
          factors: [
            `Soil Type: ${capitalizeWords(data.field_specific_factors.soil_type)}`,
            `Previously Planted Crop: ${capitalizeWords(data.field_specific_factors.previously_planted_crop)}`,
            `Rainfall Trend: ${data.field_specific_factors.rainfall_trend === 2 ? 'Steady' : data.field_specific_factors.rainfall_trend === 1 ? 'Increasing' : 'Decreasing'}`,
          ],
          alternativeOptions: [
            {
              method: capitalizeWords(data.alternative_tillage_option_1.equipment),
              cost: data.alternative_tillage_option_1.total_cost_of_this_option
            },
            {
              method: capitalizeWords(data.alternative_tillage_option_2.equipment),
              cost: data.alternative_tillage_option_2.total_cost_of_this_option
            }
          ],
          explanation: data.summary_info_blurb.charAt(0).toUpperCase() + data.summary_info_blurb.slice(1),
          tillageDates: {
            fall: data.tillage_dates.optimal_fall_tillage_date,
            spring: data.tillage_dates.optimal_spring_tillage_date,
            explanation: data.tillage_dates.reason_for_tillage_dates.charAt(0).toUpperCase() + data.tillage_dates.reason_for_tillage_dates.slice(1)
          }
        };

        setRecommendation(recommendation);
        setLoading(false);

        // Create system message with recommendation
        const systemMessage = {
          type: 'system',
          content: data.response_to_user_question,
          recommendation: recommendation
        };

        // Update chat history and chats with both messages
        const updatedChatHistory = [...chatHistory, userMessage, systemMessage];
        setChatHistory(updatedChatHistory);

        // Update the chat in the chats array
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === selectedChatId 
              ? { 
                  ...chat, 
                  messages: updatedChatHistory,
                  lastRecommendation: recommendation // Store the most recent recommendation
                }
              : chat
          )
        );

      } catch (error) {
        console.error('API Request Error:', error);
        setError("Failed to get recommendations. Please try again.");
        setLoading(false);
      }

    } catch (err) {
      console.error('Submission Error:', err);
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
      <Box sx={{ 
        display: 'flex',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <Box sx={{
          display: 'flex',
          transition: 'width 0.3s ease',
          width: isSidebarCollapsed ? '50px' : '280px',
          position: 'relative',
          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          borderRight: `1px solid ${theme.palette.divider}`,
        }}>
          <ChatSidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            isCollapsed={isSidebarCollapsed}
          />
          <IconButton
            onClick={toggleSidebar}
            sx={{
              position: 'absolute',
              right: '-12px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              width: '24px',
              height: '24px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              zIndex: 1,
            }}
          >
            {isSidebarCollapsed ? <ChevronRight sx={{ fontSize: 18 }} /> : <ChevronLeft sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>
        
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden'
        }}>
          <Box {...getRootProps()} sx={{ 
            height: '100vh',
            overflow: 'hidden',
            transform: 'scale(1)',
            transformOrigin: 'top center',
          }}>
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
            <Container 
              maxWidth={false} 
              sx={{ 
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Header with IntillaSense logo and theme toggle */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                position: 'relative',
                left: 0,
                top: 0,
                zIndex: 2,
                width: '100%',
                px: 0,
                pt: 2,
                pr: chatHistory.length > 0 ? '41%' : 0
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
                    px: 0,
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
                gap: 2,
                mt: chatHistory.length > 0 ? 0 : 0,
                height: '100%'
              }}>
                {/* Main title section */}
                <Fade in={!chatHistory.length}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    mb: 0,
                    height: chatHistory.length > 0 ? 0 : 'auto',
                    overflow: 'hidden'
                  }}>
                    <Typography 
                      variant="h2" 
                      component="h1" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: theme.palette.text.primary,
                        mb: 2,
                        visibility: chatHistory.length > 0 ? 'hidden' : 'visible',
                        opacity: chatHistory.length > 0 ? 0 : 1,
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      What can I help with?
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="text.secondary" 
                      sx={{ 
                        maxWidth: 600, 
                        mx: 'auto',
                        fontStyle: 'italic',
                        mb: 2,
                        visibility: chatHistory.length > 0 ? 'hidden' : 'visible',
                        opacity: chatHistory.length > 0 ? 0 : 1,
                        transition: 'all 0.3s ease-in-out',
                        '& .highlight': {
                          background: mode === 'dark' 
                            ? 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)'
                            : 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          display: 'inline',
                        }
                      }}
                    >
                      AI-Powered, data-driven farming insights <span className="highlight">from the ground up</span>
                    </Typography>
                  </Box>
                </Fade>

                {/* Main input section with action buttons */}
                <Box sx={{ 
                  width: '100%', 
                  maxWidth: chatHistory.length > 0 ? '2600px' : '100%', 
                  mx: 'auto',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 0,
                  alignItems: 'stretch',
                  justifyContent: 'center',
                  flex: 1,
                  position: 'relative',
                  pr: chatHistory.length > 0 ? '40%' : 0,
                  overflow: 'hidden'
                }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 0,
                      backgroundColor: 'transparent',
                      width: chatHistory.length > 0 ? '100%' : '60%',
                      transition: 'all 0.3s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      position: 'relative',
                      maxHeight: '91%'
                    }}
                  >
                    {/* Chat history */}
                    <Box 
                      ref={chatBoxRef}
                      sx={{ 
                        flex: 1, 
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        p: 2,
                        pb: 4,
                        mb: 0,
                        visibility: chatHistory.length > 0 ? 'visible' : 'hidden',
                        opacity: chatHistory.length > 0 ? 1 : 0,
                        scrollBehavior: 'smooth',
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                        }
                      }}
                    >
                      {chatHistory.map((message, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                            gap: 1,
                          }}
                        >
                          {message.image && (
                            <Paper
                              elevation={0}
                              sx={{
                                width: 200,
                                height: 120,
                                overflow: 'hidden',
                                borderRadius: 2,
                              }}
                            >
                              <Box
                                component="img"
                                src={message.image}
                                alt="Uploaded"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Paper>
                          )}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              backgroundColor: message.type === 'user' 
                                ? theme.palette.primary.main
                                : mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                              color: message.type === 'user' ? '#fff' : 'inherit',
                              borderRadius: 2,
                              maxWidth: '80%',
                            }}
                          >
                            <Typography variant="body1">
                              {message.content}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                      {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }}>
                          <CircularProgress size={20} />
                        </Box>
                      )}
                    </Box>

                    {/* Input section */}
                    <Box sx={{ 
                      width: '100%',
                      mt: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      backgroundColor: theme.palette.background.default,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      pt: 3,
                      pb: 0,
                      px: 2,
                    }}>
                      {/* Farm selection */}
                      <ToggleButtonGroup
                        value={selectedFarm}
                        exclusive
                        onChange={handleFarmChange}
                        aria-label="farm selection"
                        sx={{
                          alignSelf: 'center',
                          mb: 0.5,
                          '& .MuiToggleButton-root': {
                            borderRadius: '100px',
                            px: 3,
                            py: 0.5,
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

                      <InputSection 
                        onSubmit={handleSubmission} 
                        loading={loading} 
                        imageFile={imageFile}
                        setImageFile={setImageFile}
                        recommendation={recommendation}
                      />
                    </Box>
                  </Paper>

                  {/* Recommendations display */}
                  <Fade in={loading || !!recommendation}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 4,
                        width: { xs: '100%', md: '40%' }, // Increased width from 30% to 40%
                        backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        opacity: chatHistory.length > 0 ? 1 : 0,
                        visibility: chatHistory.length > 0 ? 'visible' : 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        height: '100vh',
                        overflowY: 'auto'
                      }}
                    >
                      {loading ? (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          gap: 2,
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
                        <RecommendationDisplay recommendation={recommendation} />
                      )}
                    </Paper>
                  </Fade>
                </Box>
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
                    zIndex: 1300,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
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
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
