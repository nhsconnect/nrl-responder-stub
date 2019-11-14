# README

Endpoints are constructed as if the root is the SSP URL, i.e. the Provider URL must be percent-encoded and appended to the root.

For example:
```
https://provider1.example.com/api/patients/1/records/sample.json
```
Becomes:
```
http://localhost:<portNumber>/https%3A%2F%2Fprovider1.example.com%2Fapi%2Fpatients%2F1%2Frecords%2Fsample.json
```

