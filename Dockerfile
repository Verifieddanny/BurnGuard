FROM golang:1.23-alpine AS builder
WORKDIR /app

RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server/api

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/server .

COPY --from=builder /go/bin/migrate /usr/local/bin/migrate

COPY --from=builder /app/internal/migrations ./internal/migrations

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENV PORT=10000
EXPOSE ${PORT}

ENTRYPOINT ["./entrypoint.sh"]
CMD ["./server"]
