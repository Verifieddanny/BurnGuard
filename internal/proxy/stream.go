package proxy

import (
	"bufio"
	"bytes"
	"context"
	"io"
	"log"

	"github.com/Verifieddanny/bunguard/internal/alerts"
	"github.com/Verifieddanny/bunguard/internal/budget"
	"github.com/Verifieddanny/bunguard/internal/storage"
)

type SSEParser func(dataLines [][]byte, requestPath string) (*storage.Usage, error)


type StreamReader struct {
	reader io.ReadCloser
	buffer bytes.Buffer
	storage storage.Storage
	tracker *budget.Tracker
	parser      SSEParser
	requestPath string
	alerter     *alerts.Alerter
	budgetLimit float64
}

func NewStreamReader(reader io.ReadCloser, storage storage.Storage, tracker *budget.Tracker, parser SSEParser, requestPath string, alerter *alerts.Alerter, budgetLimit float64) *StreamReader {
	return &StreamReader{
		reader: reader,
		storage: storage,
		tracker: tracker,
		parser: parser,
		requestPath: requestPath,
		alerter: alerter,
		budgetLimit: budgetLimit,
	}
}

func (sr *StreamReader) Read(p []byte) (int, error) {
	n, err := sr.reader.Read(p)

	if n > 0 {
		sr.buffer.Write(p[:n])
	}
	return n, err
}

func (sr *StreamReader) Close() error {
	err := sr.reader.Close()

	var dataLines [][]byte

	scanner := bufio.NewScanner(&sr.buffer)
	for scanner.Scan() {
		line := scanner.Bytes()
		if bytes.HasPrefix(line, []byte("data: ")) {
			payload := bytes.TrimPrefix(line, []byte("data: "))
			if string(payload) == "[DONE]" {
				continue
			}
			dataLines = append(dataLines, payload)
		}
	}

	if len(dataLines) == 0 {
		return err
	}

	usage, parseErr := sr.parser(dataLines, sr.requestPath)
	if parseErr != nil {
		log.Println("Failed to parse SSE stream:", parseErr)
		return err
	}

	if usage != nil {
		if storeErr := sr.storage.Usage.Create(context.Background(), usage); storeErr != nil {
			log.Println("Failed to store streaming usage:", storeErr)
		} else {
			sr.tracker.Add(usage.Cost)
			sr.alerter.Check(sr.tracker.Total(), sr.budgetLimit)
			log.Printf("Stream — Input: %d Output: %d Cost: $%.6f",
				usage.InputTokens,
				usage.OutputTokens,
				usage.Cost,
			)
		}
	}

	return err
}
