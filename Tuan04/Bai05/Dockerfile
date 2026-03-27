
FROM golang:1.20

WORKDIR /app

COPY main.go .

RUN go mod init my-go-app && go build -o main .

CMD ["./main"]