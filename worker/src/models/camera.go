package models

type Camera struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	RTSPURL   string `json:"rtspUrl"`
	Location  string `json:"location,omitempty"`
	IsActive  bool   `json:"isActive"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
	UserID    string `json:"userId"`
}

type CameraRequest struct {
	CameraID string `json:"cameraId" binding:"required"`
	RTSPURL  string `json:"rtspUrl" binding:"required"`
}
