package main

import (
	"log"
	"os"
	"sync"

	"worker/src/handlers"
    "worker/src/processors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort string
	APIToken   string
	APIBaseURL string
}

var (
	config      Config
	cameraPools map[string]*processors.CameraPool
	mu          sync.RWMutex
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	config = Config{
		ServerPort: getEnv("WORKER_PORT", "9000"),
		APIToken:   getEnv("API_TOKEN", ""),
		APIBaseURL: getEnv("API_BASE_URL", "http://localhost:5000"),
	}

	cameraPools = make(map[string]*processors.CameraPool)
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func main() {
	router := gin.Default()

	// Routes
	router.POST("/stream/start", handlers.StartStreamHandler(cameraPools))
	router.POST("/stream/stop/:cameraId", handlers.StopStreamHandler(cameraPools))
	router.GET("/health", handlers.HealthHandler)

	log.Printf("Worker server starting on port %s", config.ServerPort)
	if err := router.Run(":" + config.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
