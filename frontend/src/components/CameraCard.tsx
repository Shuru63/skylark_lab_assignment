import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { MoreVert, PlayArrow, Stop, Edit, Delete } from '@mui/icons-material';
import type { Camera } from '../types';
import { useCameras } from '../hooks/useCameras';
import { CameraDialog } from './CameraDialog';

interface CameraCardProps {
  camera: Camera;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { updateCamera, deleteCamera, toggleCamera } = useCameras();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleStream = async () => {
    try {
      const updatedCamera = await toggleCamera(camera.id, !camera.isActive);
      setIsPlaying(updatedCamera.isActive);
    } catch (err) {
      console.error('Failed to toggle camera:', err);
    }
  };

  const handleEdit = () => {
    handleMenuClose();
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    handleMenuClose();
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateCamera = async (cameraData: any) => {
    try {
      await updateCamera(camera.id, cameraData);
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Failed to update camera:', err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCamera(camera.id);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete camera:', err);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="div">
              {camera.name}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>

          <Typography color="textSecondary" gutterBottom>
            {camera.location || 'No location specified'}
          </Typography>

          <Chip
            label={camera.isActive ? 'Active' : 'Inactive'}
            color={camera.isActive ? 'success' : 'default'}
            size="small"
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              width: '100%',
              height: 200,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              mb: 2,
            }}
          >
            {isPlaying ? (
              <Typography>Video Stream (WebRTC would be here)</Typography>
            ) : (
              <Typography color="textSecondary">Stream offline</Typography>
            )}
          </Box>
        </CardContent>

        <CardActions>
          <Button
            size="small"
            startIcon={camera.isActive ? <Stop /> : <PlayArrow />}
            onClick={handleToggleStream}
            color={camera.isActive ? 'error' : 'primary'}
          >
            {camera.isActive ? 'Stop' : 'Start'}
          </Button>
        </CardActions>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <CameraDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdateCamera}
        initialData={camera}
        isEdit
      />

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Camera</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the camera "{camera.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};