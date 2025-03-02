import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme
} from '@mui/material';
import { AttachMoney, Agriculture, Info, CalendarMonth } from '@mui/icons-material';

const RecommendationDisplay = ({ recommendation, onSwitchCommand }) => {
  const theme = useTheme();
  
  // Function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleAlternativeClick = (index) => {
    const switchCommand = `switch the primary recommendation with alternative option ${index + 1}`;
    onSwitchCommand(switchCommand);
  };

  if (!recommendation) return null;

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Typography variant="h5" gutterBottom color="text.primary" sx={{ 
        position: 'sticky', 
        top: 0, 
        pt: 2, 
        pb: 2, 
        zIndex: 1,
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        mb: 2
      }}>
        Tillage Recommendations
      </Typography>

      <Box sx={{ 
        height: 'calc(100% - 60px)',
        overflowY: 'auto',
        pr: 2,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          },
        },
      }}>
        <Grid container spacing={3}>
          {recommendation.tillageDates && (
            <Grid item xs={12}>
              <Card sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                borderRadius: 2 
              }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonth />
                    Optimal Tillage Dates
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Typography variant="subtitle1" color="text.primary">
                      Fall Tillage: {formatDate(recommendation.tillageDates.fall)}
                    </Typography>
                    <Typography variant="subtitle1" color="text.primary">
                      Spring Tillage: {formatDate(recommendation.tillageDates.spring)}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {recommendation.tillageDates.explanation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <Card sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
              borderRadius: 2 
            }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Primary Recommendation
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Agriculture sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="subtitle1" color="text.primary">
                    {recommendation.primaryMethod}
                  </Typography>
                </Box>

                <Divider sx={{ 
                  my: 2,
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
                }} />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Estimated Costs
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ mr: 1, color: theme.palette.success.main }} />
                  <Typography color="text.primary">
                    {formatCurrency(recommendation.estimatedCost)}
                  </Typography>
                </Box>

                <Divider sx={{ 
                  my: 2,
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
                }} />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Benefits
                </Typography>
                <List dense>
                  {recommendation.benefits?.map((benefit, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={benefit}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: theme.palette.text.primary
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Field-Specific Factors
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {recommendation.factors?.map((factor, index) => (
                      <Chip
                        key={index}
                        label={factor}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          borderColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : undefined,
                          '& .MuiChip-label': {
                            color: theme.palette.mode === 'dark' ? theme.palette.primary.main : undefined
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {recommendation.alternativeOptions?.map((option, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                borderRadius: 2 
              }}>
                <CardContent>
                  <Typography variant="h6" color="secondary" gutterBottom>
                    Alternative Option {index + 1}
                  </Typography>
                  <Typography variant="body1" color="text.primary">{option.method}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Cost: {formatCurrency(option.cost)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Card sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
              borderRadius: 2 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Info sx={{ color: theme.palette.info.main }} />
                  <Typography variant="body1" color="text.primary">
                    {recommendation.explanation}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default RecommendationDisplay; 