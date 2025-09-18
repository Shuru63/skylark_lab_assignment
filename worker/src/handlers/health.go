package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func HealthHandler(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "status":  "healthy",
        "service": "worker",
        "version": "1.0.0",
    })
}
