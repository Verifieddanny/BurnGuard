FROM golang:1.26-alpine AS builder
WORKDIR /app

ENV GOTOOLCHAIN=auto

RUN apk add --no-cache curl

ARG MIGRATE_VERSION=v4.18.2
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/${MIGRATE_VERSION}/migrate.linux-amd64.tar.gz | tar xvz \
    && mv migrate /tmp/migrate

COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server/api

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/server .

COPY --from=builder /tmp/migrate /usr/local/bin/migrate

COPY --from=builder /app/internal/migrations ./internal/migrations

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENV PORT=10000
EXPOSE ${PORT}

ENTRYPOINT ["./entrypoint.sh"]
CMD ["./server"]
