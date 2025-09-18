package handlers

import (
	"net/http"

	"worker/processors"
	"github.com/gin-gonic/gin"
)

type StartStreamRequest struct {
	CameraID string `json:"cameraId" binding:"required"`
	RTSPURL  string `json:"rtspUrl" binding:"required"`
}

// Pass cameraPools map reference
func StartStreamHandler(cameraPools map[string]*processors.CameraPool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req StartStreamRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Start processing
		if _, exists := cameraPools[req.CameraID]; !exists {
			cameraPools[req.CameraID] = &processors.CameraPool{
				ID:      req.CameraID,
				RTSPURL: req.RTSPURL,
			}
		}
		cameraPools[req.CameraID].Start()

		c.JSON(http.StatusOK, gin.H{
			"message":  "Stream processing started",
			"cameraId": req.CameraID,
		})
	}
}

func StopStreamHandler(cameraPools map[string]*processors.CameraPool) gin.HandlerFunc {
	return func(c *gin.Context) {
		cameraID := c.Param("cameraId")
		if pool, exists := cameraPools[cameraID]; exists {
			pool.Stop()
			delete(cameraPools, cameraID)
		}

		c.JSON(http.StatusOK, gin.H{
			"message":  "Stream processing stopped",
			"cameraId": cameraID,
		})
	}
}
