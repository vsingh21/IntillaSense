import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  IconButton, 
  useTheme,
  Collapse,
  Tooltip
} from '@mui/material';
import { 
  MicNone, 
  MicOff, 
  Image as ImageIcon,
  Add
} from '@mui/icons-material';
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
    noClick: true
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
      
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={5}
          placeholder="Describe your field conditions or ask for recommendations..."
          value={textInput}
          onChange={(e) => {
            setTextInput(e.target.value);
            setValidationError('');
          }}
          onKeyPress={handleSubmit}
          disabled={loading}
          sx={{
            '& .MuiInputBase-root': {
              py: 1.5,
              px: 2,
            },
          }}
          InputProps={{
            endAdornment: (
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                alignItems: 'center',
                mr: 1
              }}>
                {imageFile && (
                  <Tooltip title={imageFile.name}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                        borderRadius: '100px',
                        padding: '4px 12px',
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
                  </Tooltip>
                )}
                <Tooltip title="Add field image">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const input = document.querySelector('input[type="file"]');
                      if (input) input.click();
                    }}
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    <Add sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={listening ? "Stop recording" : "Start voice input"}>
                  <IconButton
                    size="small"
                    onClick={toggleListening}
                    sx={{
                      backgroundColor: listening 
                        ? theme.palette.error.dark
                        : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                      color: listening ? '#fff' : 'inherit',
                      '&:hover': {
                        backgroundColor: listening
                          ? theme.palette.error.main
                          : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    {listening ? <MicOff sx={{ fontSize: 20 }} /> : <MicNone sx={{ fontSize: 20 }} />}
                  </IconButton>
                </Tooltip>
              </Box>
            ),
          }}
        />
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
    </Box>
  );
};

export default InputSection; 