import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import { Face, CameraAlt } from '@mui/icons-material';
import { useAlerts } from '../contexts/AlertContext';
import { formatDistanceToNow } from 'date-fns';

export const AlertList: React.FC = () => {
  const { alerts } = useAlerts();

  if (alerts.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="textSecondary" align="center">
          No alerts yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <List>
        {alerts.map((alert) => (
          <ListItem key={alert.id} divider>
            <ListItemAvatar>
              <Avatar>
                <Face />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">
                    Face detected on {alert.cameraName}
                  </Typography>
                  <Chip
                    icon={<CameraAlt />}
                    label={`${(alert.confidence * 100).toFixed(1)}%`}
                    size="small"
                    color="primary"
                  />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="textSecondary">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};