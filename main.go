package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"syscall"
	"time"
)

// Embed all files from dist folder into the binary
//
//go:embed all:dist
var distFS embed.FS

func findAvailablePort() (int, error) {
	preferred := 48921
	l, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", preferred))
	if err == nil {
		l.Close()
		return preferred, nil
	}

	addr, err := net.ResolveTCPAddr("tcp", "127.0.0.1:0")
	if err != nil {
		return 0, err
	}
	l, err = net.ListenTCP("tcp", addr)
	if err != nil {
		return 0, err
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port, nil
}

func openInAppWindow(targetURL string) *exec.Cmd {
	if runtime.GOOS != "windows" {
		cmd := exec.Command("xdg-open", targetURL)
		cmd.Start()
		return cmd
	}

	edgeCandidates := []string{
		`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
		`C:\Program Files\Microsoft\Edge\Application\msedge.exe`,
		filepath.Join(os.Getenv("LOCALAPPDATA"), `Microsoft\Edge\Application\msedge.exe`),
	}

	chromeCandidates := []string{
		`C:\Program Files\Google\Chrome\Application\chrome.exe`,
		`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`,
		filepath.Join(os.Getenv("LOCALAPPDATA"), `Google\Chrome\Application\chrome.exe`),
	}

	for _, path := range edgeCandidates {
		if _, err := os.Stat(path); err == nil {
			cmd := exec.Command(path, fmt.Sprintf("--app=%s", targetURL), "--window-size=1440,920")
			if err := cmd.Start(); err == nil {
				return cmd
			}
		}
	}

	for _, path := range chromeCandidates {
		if _, err := os.Stat(path); err == nil {
			cmd := exec.Command(path, fmt.Sprintf("--app=%s", targetURL), "--window-size=1440,920")
			if err := cmd.Start(); err == nil {
				return cmd
			}
		}
	}

	cmd := exec.Command("rundll32", "url.dll,FileProtocolHandler", targetURL)
	cmd.Start()
	return cmd
}

func main() {
	subFS, err := fs.Sub(distFS, "dist")
	if err != nil {
		log.Fatalf("Gagal memuat embedded assets: %v", err)
	}

	port, err := findAvailablePort()
	if err != nil {
		log.Fatalf("Gagal menemukan port kosong: %v", err)
	}

	url := fmt.Sprintf("http://127.0.0.1:%d", port)

	fileServer := http.FileServer(http.FS(subFS))
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		fileServer.ServeHTTP(w, r)
	})

	server := &http.Server{
		Addr:    fmt.Sprintf("127.0.0.1:%d", port),
		Handler: handler,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("Server error: %v\n", err)
		}
	}()

	// Handle manual exit via endpoint if needed
	exitChan := make(chan struct{})
	http.HandleFunc("/api/shutdown", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Shutting down..."))
		go func() {
			time.Sleep(500 * time.Millisecond)
			close(exitChan)
		}()
	})

	fmt.Println("=========================================================")
	fmt.Println("  AzniAbstractMotion - 4K Microstock Generator")
	fmt.Println("=========================================================")
	fmt.Printf("  Aplikasi berjalan di: %s\n", url)
	fmt.Println("  Jendela aplikasi sedang dibuka...")
	fmt.Println("  Tutup jendela aplikasi atau tekan Ctrl+C untuk keluar.")
	fmt.Println("=========================================================")

	time.Sleep(200 * time.Millisecond)
	openInAppWindow(url)

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	select {
	case <-sigChan:
		fmt.Println("\nMenutup aplikasi (Sinyal diterima)...")
	case <-exitChan:
		fmt.Println("\nMenutup aplikasi (Permintaan shutdown)...")
	}

	server.Close()
	time.Sleep(200 * time.Millisecond)
}
