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
  Button
} from '@mui/material';
import { 
  MicNone, 
  MicOff, 
  Image as ImageIcon,
  Add,
  Search,
  ArrowUpward
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const InputSection = ({ onSubmit, loading }) => {
  const theme = useTheme();
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(true);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setBrowserSupportsSpeech(false);
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (transcript && listening) {
      setTextInput((prevText) => {
        const prefix = prevText ? prevText + ' ' : '';
        return prefix + transcript;
      });
      console.log('Current voice transcript:', transcript);
      resetTranscript();
    }
  }, [transcript, listening, resetTranscript]);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Check if file size is less than 5MB (5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('File size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setValidationError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    noClick: true,
    maxSize: 5 * 1024 * 1024, // 5MB in bytes
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles[0]?.errors[0]?.code === 'file-too-large') {
        setValidationError('File size must be less than 5MB');
      }
    }
  });

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
      SpeechRecognition.startListening({ 
        continuous: true,
        language: 'en-US'
      });
    }
  };

  return (
    <Box 
      {...getRootProps()}
      sx={{ 
        width: '100%',
        position: 'relative',
      }}
    >
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
      
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={15}
            placeholder="Ask anything"
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setValidationError('');
            }}
            onKeyPress={handleSubmit}
            disabled={loading}
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {
                py: 1.5,
                px: 2,
                width: '100%',
                alignItems: 'flex-start',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(32, 33, 35, 1)' : 'rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(32, 33, 35, 0.9)' : 'rgba(0, 0, 0, 0.07)',
                },
                '& textarea': {
                  fontSize: '16px',
                  lineHeight: 1.5,
                  transition: 'all 0.2s ease-in-out',
                },
                transition: 'border-radius 0.2s ease-in-out',
                borderRadius: (theme) => {
                  const numLines = (textInput.match(/\n/g) || []).length + 1;
                  const baseRadius = 12;
                  const minRadius = 4;
                  // Decrease radius as lines increase, with a minimum
                  return Math.max(baseRadius - (numLines - 1) * 2, minRadius) + 'px';
                },
                // Remove the focus outline
                '& fieldset': {
                  border: 'none',
                },
                '&.Mui-focused': {
                  outline: 'none',
                  '& fieldset': {
                    border: 'none !important',
                  }
                },
              },
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            alignItems: 'center',
            pl: 1,
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const input = document.querySelector('input[type="file"]');
                  if (input) input.click();
                }}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: 'transparent',
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '50%',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.2)',
                  }
                }}
              >
                <Add sx={{ fontSize: 20 }} />
              </IconButton>
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
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    backgroundColor: 'transparent',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                  }
                }}
              >
                {listening ? <MicOff sx={{ fontSize: 20 }} /> : <MicNone sx={{ fontSize: 20 }} />}
              </IconButton>
              {imageFile && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                  }}
                >
                  <ImageIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {imageFile.name}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.7 }}>×</Typography>
                </Box>
              )}
            </Box>
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
              }}
              disabled={loading || (!textInput && !imageFile)}
              sx={{
                width: 32,
                height: 32,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(64, 65, 79, 1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '50%',
                color: (!textInput && !imageFile) ? 'rgba(255, 255, 255, 0.3)' : 'inherit',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(71, 72, 89, 1)' : 'rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(64, 65, 79, 0.5)' : 'rgba(0, 0, 0, 0.03)',
                }
              }}
            >
              <ArrowUpward sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
        <input {...getInputProps()} />
      </Box>

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
          variant="caption" 
          color="primary" 
          sx={{ 
            display: 'block',
            mt: 1,
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