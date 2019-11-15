# README

## Setup

Various configuration options are available in `config.json`.

Properties:
* `useFhirMimeTypes`: If `true` (default), MIME types of JSON and XML responses will be set to `application/fhir+json` and `application/fhir+xml` respectively.
* `testServerPort`: The port over which to serve the test app.
* `logOutput`
  - `stdout`: Show log output in real-time in the terminal.
  - `logsDir`: Save logs as JSON files in `/logs` directory.
* `logBodyMaxLength`: Maximum chars of response body to log, after which the body will be truncated.
  - `-1` logs the entire response body.
  - `0` logs no response body.
* `providerUrlFileMap`: To add records to test against, place the files in the `/responses` directory, and add a mapping for each to this property. The key of each mapping must be a valid URL, but it doesn&rsquo;t have to point to anything.

## Running tests

While the app is running, tests can be run against each of the records specified in the configuration.

1.  Start the app

    ```
    npm run s
    ```

2.  Send a `GET` request to the relevant endpoint from the application under test.
    
    Endpoints are constructed as if the root is the SSP URL, i.e. the Provider URL must be percent-encoded and appended to the root. Provider URLs are as configured in the `providerUrlFileMap` property of `config.json`.

    For example:

    ```
    https://provider1.example.com/api/patients/1/records/sample.json
    ```
    Becomes:

    <pre><code><span id="urlOrigin">http://localhost:&lt;portNumber&gt;</span>/https%3A%2F%2Fprovider1.example.com%2Fapi%2Fpatients%2F1%2Frecords%2Fsample.json</code></pre>

Logs are output or persisted as specified in the `logOutput` property of `config.json`.

When collecting and providing evidence, set `logOutput.logsDir` to `true`, run the test cases as specified, and send the JSON output as evidence.

<!-- TODO -->
<!-- JSON logs can be viewed in human-readable format by running `npm run pretty-html <fileName>`. -->

<!-- <div class="message is-warning">
<div class="message-body" markdown="1">
**Note**: [note]
</div>
</div> -->
