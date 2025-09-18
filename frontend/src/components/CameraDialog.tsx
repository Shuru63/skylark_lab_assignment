import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import type { Camera } from '../types';

interface CameraDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Camera;
  isEdit?: boolean;
}

export const CameraDialog: React.FC<CameraDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const [name, setName] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRtspUrl(initialData.rtspUrl);
      setLocation(initialData.location || '');
    } else {
      setName('');
      setRtspUrl('');
      setLocation('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      rtspUrl,
      location: location || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Camera' : 'Add New Camera'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Camera Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="RTSP URL"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              required
              fullWidth
              placeholder="rtsp://username:password@camera-ip:554/stream"
            />
            <TextField
              label="Location (Optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Add'} Camera
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};