import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    AppBar,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
} from "@mui/material";
import { Add, AccountCircle, Logout } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCameras } from "../hooks/useCameras";
import { CameraCard } from "./CameraCard";
import { CameraDialog } from "./CameraDialog";
import { AlertList } from "./AlertList";

export const Dashboard: React.FC = () => {
    const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { user, logout } = useAuth();
    const { cameras = [], isLoading, error, addCamera } = useCameras();

    const handleAddCamera = async (cameraData: any) => {
        try {
            await addCamera(cameraData);
            setIsCameraDialogOpen(false);
        } catch (err) {
            console.error("Failed to add camera:", err);
        }
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    if (isLoading) {
        return <Typography>Loading cameras...</Typography>;
    }

    if (error) {
        return <Typography color="error">Error: {error}</Typography>;
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Top App Bar */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Camera Dashboard
                    </Typography>
                    <div>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                {user?.username}
                            </Typography>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleLogout}>
                                <Logout sx={{ mr: 1 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ p: 3 }}>
                {/* Cameras Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h4">Cameras</Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setIsCameraDialogOpen(true)}
                    >
                        Add Camera
                    </Button>
                </Box>

                {/* Camera Grid */}
                <Box display="flex" flexWrap="wrap" gap={3}>
                    {cameras.map((camera) => (
                        <Box key={camera.id} flex="1 1 300px" maxWidth="400px">
                            <CameraCard camera={camera} />
                        </Box>
                    ))}
                </Box>


                {/* Alerts Section */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Recent Alerts
                    </Typography>
                    <AlertList />
                </Box>
            </Box>

            {/* Add Camera Dialog */}
            <CameraDialog
                open={isCameraDialogOpen}
                onClose={() => setIsCameraDialogOpen(false)}
                onSubmit={handleAddCamera}
            />
        </Box>
    );
};
