package processors

import (
	"context"
	"log"
	"sync"
	"time"
)

type CameraPool struct {
	ID        string
	RTSPURL   string
	IsRunning bool
	Cancel    context.CancelFunc
	mu        sync.Mutex
}

func (cp *CameraPool) Start() {
	cp.mu.Lock()
	defer cp.mu.Unlock()

	if cp.IsRunning {
		log.Printf("Camera %s is already running", cp.ID)
		return
	}

	ctx, cancel := context.WithCancel(context.Background())
	cp.Cancel = cancel
	cp.IsRunning = true

	go cp.processStream(ctx)

	log.Printf("Started processing camera %s", cp.ID)
}

func (cp *CameraPool) Stop() {
	cp.mu.Lock()
	defer cp.mu.Unlock()

	if !cp.IsRunning {
		log.Printf("Camera %s is not running", cp.ID)
		return
	}

	cp.Cancel()
	cp.IsRunning = false

	log.Printf("Stopped processing camera %s", cp.ID)
}

func (cp *CameraPool) processStream(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Printf("Stopping processing for camera %s", cp.ID)
			return
		case <-ticker.C:
			log.Printf("Processing frames for camera %s", cp.ID)
		}
	}
}
