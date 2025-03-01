import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  IconButton, 
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  Link
} from '@mui/material';
import { MicNone, MicOff, CloudUpload, Image } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const InputSection = ({ onSubmit, loading }) => {
  const theme = useTheme();
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

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
      setImageFile(acceptedFiles[0]);
      setValidationError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    noClick: true // Disable click events on the entire page
  });

  const handleSubmit = () => {
    if (!textInput && !imageFile) {
      setValidationError('Please provide at least one form of input (text or image)');
      return;
    }
    
    setValidationError('');
    const formData = new FormData();
    if (textInput) formData.append('text', textInput);
    if (imageFile) formData.append('image', imageFile);
    
    onSubmit(formData);
  };

  const toggleListening = () => {
    if (listening) {
      console.log('Stopping voice recording');
      SpeechRecognition.stopListening();
    } else {
      console.log('Starting voice recording...');
      setValidationError('');
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <Box 
      {...getRootProps()}
      sx={{ 
        p: 2,
        position: 'relative',
        minHeight: '100%',
        '&:focus': {
          outline: 'none'
        }
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
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <Typography variant="h5" sx={{ color: '#fff', textAlign: 'center' }}>
            Drop your field image here
          </Typography>
        </Box>
      )}
      
      <Typography variant="h6" gutterBottom color="text.primary">
        Enter Field Information
      </Typography>
      
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Describe your field conditions"
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setValidationError('');
              }}
              disabled={loading}
              placeholder="Example: My field has clay soil, was previously used for corn, and has a slight slope. The annual rainfall is moderate..."
              sx={{
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                },
              }}
            />
            <IconButton 
              onClick={toggleListening}
              color={listening ? 'error' : 'primary'}
              disabled={loading}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              {listening ? <MicOff /> : <MicNone />}
            </IconButton>
          </Box>
          {listening && (
            <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
              Listening... Speak to add text
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            opacity: loading ? 0.7 : 1 
          }}>
            <input {...getInputProps()} />
            <Image sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
            <Link
              component="button"
              variant="body2"
              onClick={(e) => {
                e.stopPropagation();
                const input = document.querySelector('input[type="file"]');
                if (input) input.click();
              }}
              sx={{ 
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              disabled={loading}
            >
              Click to upload a field image
            </Link>
            {imageFile && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {imageFile.name}
                </Typography>
                <Button 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                  }}
                  disabled={loading}
                  sx={{ 
                    ml: 1,
                    minWidth: 'auto',
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Remove
                </Button>
              </>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Getting Recommendations...' : 'Get Tillage Recommendations'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InputSection; 