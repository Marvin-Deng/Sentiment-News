package statsig

import (
	"fmt"
	"os"

	statsigsdk "github.com/statsig-io/go-sdk"
)

// Initialize starts the Statsig server SDK using the STATSIG_KEY environment variable.
func Initialize() error {
	key := os.Getenv("STATSIG_KEY")
	if key == "" {
		return fmt.Errorf("STATSIG_KEY is required")
	}

	statsigsdk.Initialize(key)
	return nil
}

// Shutdown flushes pending events and stops the SDK's background workers.
func Shutdown() {
	statsigsdk.Shutdown()
}
