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
  useTheme
} from '@mui/material';
import { MicNone, MicOff, CloudUpload } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const InputSection = ({ onSubmit, loading }) => {
  const theme = useTheme();
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      console.log('Current voice transcript:', transcript);
    }
  }, [transcript]);

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
    maxFiles: 1
  });

  const handleSubmit = () => {
    if (!textInput && !transcript && !imageFile) {
      setValidationError('Please provide at least one form of input (text, voice, or image)');
      return;
    }
    
    setValidationError('');
    const formData = new FormData();
    if (textInput) formData.append('text', textInput);
    if (transcript) {
      console.log('Submitting voice transcript:', transcript);
      formData.append('voice', transcript);
    }
    if (imageFile) formData.append('image', imageFile);
    
    onSubmit(formData);
  };

  const toggleListening = () => {
    if (listening) {
      console.log('Stopping voice recording. Final transcript:', transcript);
      SpeechRecognition.stopListening();
    } else {
      console.log('Starting voice recording...');
      setValidationError('');
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const clearTranscript = () => {
    console.log('Clearing voice transcript');
    resetTranscript();
  };

  return (
    <Box sx={{ p: 2 }}>
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
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={toggleListening}
              color={listening ? 'error' : 'primary'}
              disabled={loading}
            >
              {listening ? <MicOff /> : <MicNone />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {listening ? 'Recording... Click to stop' : 'Click to start voice input'}
            </Typography>
            {transcript && (
              <Button 
                size="small" 
                onClick={clearTranscript}
                disabled={loading}
                sx={{ color: theme.palette.primary.main }}
              >
                Clear
              </Button>
            )}
          </Box>
          {transcript && (
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={transcript}
              disabled
              sx={{ 
                mt: 1,
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: theme.palette.text.secondary,
                },
              }}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Box
            {...getRootProps()}
            sx={{
              border: `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              '&:hover': {
                borderColor: loading ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)') : theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <input {...getInputProps()} disabled={loading} />
            <CloudUpload sx={{ fontSize: 40, mb: 2, color: theme.palette.text.secondary }} />
            <Typography color="text.secondary">
              {isDragActive
                ? 'Drop your field images here'
                : 'Drag & drop field images here, or click to select'}
            </Typography>
            {imageFile && (
              <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                Selected: {imageFile.name}
                <Button 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                  }}
                  disabled={loading}
                  sx={{ ml: 1, color: theme.palette.primary.main }}
                >
                  Remove
                </Button>
              </Typography>
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