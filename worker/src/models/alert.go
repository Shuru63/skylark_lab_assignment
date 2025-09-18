package models

import "time"

type Alert struct {
	ID         string    `json:"id"`
	CameraID   string    `json:"cameraId"`
	UserID     string    `json:"userId"`
	Timestamp  time.Time `json:"timestamp"`
	Confidence float64   `json:"confidence"`
	ImageURL   string    `json:"imageUrl,omitempty"`
}

type AlertRequest struct {
	CameraID   string  `json:"cameraId" binding:"required"`
	UserID     string  `json:"userId" binding:"required"`
	Confidence float64 `json:"confidence" binding:"required"`
	ImageData  []byte  `json:"imageData,omitempty"`
}
