import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Button,
  Typography,
  Divider,
  useTheme,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const ChatSidebar = ({ 
  chats, 
  selectedChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  isCollapsed 
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <Button
        variant="contained"
        onClick={onNewChat}
        sx={{
          mt: 2,
          mb: 1,
          mx: 2,
          borderRadius: '100px',
          minWidth: isCollapsed ? '40px' : '140px',
          width: isCollapsed ? '40px' : 'auto',
          height: '40px',
          p: 0,
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: isCollapsed ? 'center' : 'stretch',
          '& .MuiSvgIcon-root': {
            transition: 'all 0.3s ease',
            fontSize: 24,
            flexShrink: 0,
            mr: isCollapsed ? 0 : 1,
          },
          '& .button-text': {
            transition: 'all 0.3s ease',
            opacity: isCollapsed ? 0 : 1,
            maxWidth: isCollapsed ? 0 : '200px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            pr: isCollapsed ? 0 : 1,
          }
        }}
      >
        <AddIcon />
        <span className="button-text">New Chat</span>
      </Button>

      <List sx={{ 
        overflowY: 'auto',
        flex: 1,
        pt: 1,
        px: 0,
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        }
      }}>
        {chats.map((chat) => (
          <ListItem
            key={chat.id}
            disablePadding
            secondaryAction={
              !isCollapsed && (
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onDeleteChat(chat.id)}
                  sx={{ mr: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              )
            }
            sx={{ mb: 1 }}
          >
            <ListItemButton
              selected={selectedChatId === chat.id}
              onClick={() => onSelectChat(chat.id)}
              sx={{
                borderRadius: 2,
                mx: isCollapsed ? 0.5 : 1,
                px: isCollapsed ? 0 : 2,
                py: 1,
                overflow: 'hidden',
                width: '100%',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: isCollapsed ? 'auto' : 40,
                mr: isCollapsed ? 0 : 2,
              }}>
                <ChatIcon sx={{ fontSize: isCollapsed ? 20 : 24 }} />
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText 
                  primary={chat.title || 'New Chat'}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { pr: 4 }
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChatSidebar; 