# README

<!-- [/urls](/urls) provides a list of the available Provider URLs for testing, as if retrieved from pointers. -->

Endpoints are constructed as if the root is the SSP URL, i.e. the Provider URL must be percent-encoded and appended to the root.

For example:
```
https://provider1.example.com/api/patients/3b687ca0-47d7-4d2f-846c-768c9b7138bb/records/cb8e5386-35c4-4dd3-a6ce-7f08fa8853f8.json
```
Becomes:
```
http://localhost:<portNumber>/https%3A%2F%2Fprovider1.example.com%2Fapi%2Fpatients%2F3b687ca0-47d7-4d2f-846c-768c9b7138bb%2Frecords%2Fcb8e5386-35c4-4dd3-a6ce-7f08fa8853f8.json
```
