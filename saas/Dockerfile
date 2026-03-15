# Build
FROM golang:1.25-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server .

# Run
FROM alpine:3.21
WORKDIR /app
COPY --from=builder /server /app/server
COPY --from=builder /build/app/ /app/app/
COPY --from=builder /build/static/ /app/static/
EXPOSE 3000
CMD ["/app/server"]
