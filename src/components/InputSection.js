import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  IconButton, 
  useTheme,
  Collapse,
  Tooltip,
  Alert,
  Button,
  Paper
} from '@mui/material';
import { 
  MicNone, 
  MicOff, 
  Image as ImageIcon,
  Add,
  Search,
  ArrowUpward,
  Close
} from '@mui/icons-material';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const InputSection = ({ onSubmit, loading, imageFile, setImageFile, recommendation }) => {
  const theme = useTheme();
  const [textInput, setTextInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(true);

  const {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    clearTranscriptOnListen: true
  });

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setBrowserSupportsSpeech(false);
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (finalTranscript && listening) {
      setTextInput((prevText) => {
        const newText = prevText ? `${prevText} ${finalTranscript}` : finalTranscript;
        return newText;
      });
      resetTranscript();
    }
  }, [finalTranscript, listening]);

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!textInput && !imageFile) {
        setValidationError('Please provide at least one form of input (text or image)');
        return;
      }
      
      setValidationError('');
      const formData = new FormData();
      if (textInput) formData.append('text', textInput);
      if (imageFile) formData.append('image', imageFile);
      
      onSubmit(formData);
      setTextInput('');
      setImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      setValidationError('Your browser does not support speech recognition. Please try Chrome.');
      return;
    }

    if (listening) {
      console.log('Stopping voice recording');
      SpeechRecognition.stopListening();
    } else {
      console.log('Starting voice recording...');
      setValidationError('');
      resetTranscript();
      SpeechRecognition.startListening({ 
        continuous: true,
        interimResults: false,
        language: 'en-US'
      });
    }
  };

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      {/* Image Preview */}
      <Collapse in={!!imageFile}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          mb: 2,
          pl: 2
        }}>
          <Box sx={{ 
            position: 'relative',
            width: 'fit-content'
          }}>
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(64, 65, 79, 1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '12px',
              }}
            >
              <Box 
                component="img"
                src={imageFile ? URL.createObjectURL(imageFile) : ''}
                sx={{ 
                  width: 40,
                  height: 40,
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <Typography variant="body2">
                  {imageFile?.name || 'Uploaded image'}
                </Typography>
              </Box>
            </Paper>
            <IconButton
              size="small"
              onClick={() => {
                setImageFile(null);
                // Reset the file input
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                  fileInput.value = '';
                }
              }}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 20,
                height: 20,
                backgroundColor: theme.palette.error.main,
                color: '#fff',
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
              }}
            >
              <Close sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>
      </Collapse>

      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(64, 65, 79, 1)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '100%',
          mx: 'auto',
          px: 3,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 0 15px rgba(0, 0, 0, 0.2)' 
            : '0 0 15px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <IconButton
            size="small"
            onClick={() => document.getElementById('file-input').click()}
            sx={{
              width: 32,
              height: 32,
              backgroundColor: 'transparent',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'transparent',
                border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            <Add sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={10}
          placeholder="Ask anything"
          value={textInput}
          onChange={(e) => {
            setTextInput(e.target.value);
            setValidationError('');
          }}
          onKeyPress={handleSubmit}
          onPaste={(e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            let hasImage = false;
            for (let item of items) {
              if (item.type.startsWith('image/')) {
                hasImage = true;
                const file = item.getAsFile();
                if (file) {
                  const newFile = new File([file], `pasted-image.${file.type.split('/')[1]}`, {
                    type: file.type,
                    lastModified: new Date().getTime()
                  });
                  
                  if (newFile.size <= 5 * 1024 * 1024) {
                    setImageFile(newFile);
                    setValidationError('');
                  } else {
                    setValidationError('File size must be less than 5MB');
                  }
                }
                break;
              }
            }
            
            if (hasImage) {
              e.preventDefault();
            }
          }}
          disabled={loading}
          sx={{
            '& .MuiInputBase-root': {
              py: 1,
              px: 2,
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '& textarea': {
                fontSize: '16px',
                lineHeight: 1.5,
              },
              borderRadius: '8px',
              '& fieldset': {
                border: 'none',
              },
              '&.Mui-focused': {
                '& fieldset': {
                  border: 'none !important',
                }
              },
            },
          }}
        />

        <IconButton
          size="small"
          onClick={toggleListening}
          disabled={!browserSupportsSpeechRecognition}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: listening ? theme.palette.error.dark : 'transparent',
            border: listening ? 'none' : (theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'),
            borderRadius: '50%',
            color: listening ? '#fff' : 'inherit',
            '&:hover': {
              backgroundColor: listening ? theme.palette.error.main : 'transparent',
              border: listening ? 'none' : (theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.2)'),
            },
          }}
        >
          {listening ? <MicOff sx={{ fontSize: 20 }} /> : <MicNone sx={{ fontSize: 20 }} />}
        </IconButton>

        <IconButton
          size="small"
          onClick={() => {
            if (!textInput && !imageFile) {
              setValidationError('Please provide at least one form of input (text or image)');
              return;
            }
            const formData = new FormData();
            if (textInput) formData.append('text', textInput);
            if (imageFile) formData.append('image', imageFile);
            onSubmit(formData);
            setTextInput('');
            setImageFile(null);
            // Reset file input
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
              fileInput.value = '';
            }
          }}
          disabled={loading || (!textInput && !imageFile)}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: (!textInput && !imageFile) ? 'transparent' : theme.palette.primary.main,
            borderRadius: '50%',
            color: (!textInput && !imageFile) ? 'inherit' : '#fff',
            '&:hover': {
              backgroundColor: (!textInput && !imageFile) ? 'transparent' : theme.palette.primary.dark,
            },
            '&.Mui-disabled': {
              opacity: 0.5,
              backgroundColor: 'transparent',
            }
          }}
        >
          <ArrowUpward sx={{ fontSize: 18 }} />
        </IconButton>

        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              if (file.size > 5 * 1024 * 1024) {
                setValidationError('File size must be less than 5MB');
                return;
              }
              setImageFile(file);
              setValidationError('');
            }
          }}
          id="file-input"
        />
      </Paper>

      <Collapse in={!!validationError}>
        <Typography 
          variant="caption" 
          color="error" 
          sx={{ 
            display: 'block',
            mt: 1,
            ml: 2
          }}
        >
          {validationError}
        </Typography>
      </Collapse>

      <Collapse in={listening}>
        <Typography 
          variant="subtitle2" 
          color="primary" 
          sx={{ 
            display: 'block',
            mt: 0.5,
            ml: 2
          }}
        >
          Listening... Speak to add text
        </Typography>
      </Collapse>

      {!browserSupportsSpeech && (
        <Alert 
          severity="warning" 
          sx={{ mt: 2 }}
        >
          Speech recognition is not supported in your browser. Please use Chrome for voice input functionality.
        </Alert>
      )}
    </Box>
  );
};

export default InputSection; 