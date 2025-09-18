package utils

import (
	"log"
	"math/rand"
	"time"
)

type ReconnectStrategy struct {
	MaxAttempts int
	BaseDelay   time.Duration
	MaxDelay    time.Duration
}

func NewReconnectStrategy(maxAttempts int, baseDelay, maxDelay time.Duration) *ReconnectStrategy {
	return &ReconnectStrategy{
		MaxAttempts: maxAttempts,
		BaseDelay:   baseDelay,
		MaxDelay:    maxDelay,
	}
}

func (rs *ReconnectStrategy) Execute(operation func() error) error {
	attempt := 0
	var err error

	for attempt < rs.MaxAttempts {
		if attempt > 0 {
			delay := rs.calculateBackoff(attempt)
			log.Printf("Reconnect attempt %d after %v", attempt, delay)
			time.Sleep(delay)
		}

		err = operation()
		if err == nil {
			return nil
		}

		attempt++
		log.Printf("Operation failed (attempt %d/%d): %v", attempt, rs.MaxAttempts, err)
	}

	return err
}

func (rs *ReconnectStrategy) calculateBackoff(attempt int) time.Duration {
	delay := rs.BaseDelay * time.Duration(1<<uint(attempt))
	if delay > rs.MaxDelay {
		delay = rs.MaxDelay
	}

	jitter := time.Duration(rand.Int63n(int64(delay) / 4))
	if rand.Intn(2) == 0 {
		delay += jitter
	} else {
		delay -= jitter
	}

	return delay
}
