# Documentation

## Overview

The Consumer Record Retrieval Testing App is intended for Consumers to carry out conformance testing of their record retrieval capabilities, during local and INT stages of testing.

It is a <abbr title="command-line interface">CLI</abbr>-based application that provides a web API, the endpoints and data for which are configurable.

<!-- The test app can be run in "guided mode" or "exploratory mode".

In guided mode, instructions are provided in the CLI prompt regarding which endpoints to hit. Reports are generated once all endpoints have been hit (indicated when "Finished" is displayed in the terminal).

In exploratory mode, the test app runs continually and generates reports for any/all calls made. -->

## Prerequisites

*   NodeJS (v10 or higher).

    You can check your NodeJS installation by running `node -v`.

    If you do not have NodeJS or your NodeJS version is too low, you can download it from [the NodeJS downloads page](https://nodejs.org/en/download/).
    
The required dependencies for running the test will be installed as part of the test execution. If the dependencies are already installed, this step will be skipped.

## Setup

1.  Download and extract the .zip file from [https://url.example.com](https://url.example.com). <!-- TODO -->

2.  In a terminal, navigate to the location of the extracted files:

    ```
    cd <path to test app>
    ```

## Running tests

While the test app is running, tests can be run against each of the records specified in the configuration.

1.  Start the test app

    Windows (cmd):
    ```
    start.bat
    ```

    Linux (bash):
    ```
    ./start.sh
    ```

2.  Send a `GET` request to the relevant endpoint from the system-under-test.
    
    If `endpointFormat` is `"local"`, endpoints are constructed as if the root is the SSP URL, i.e. the Provider URL must be percent-encoded and appended to the root. Provider URLs are as configured in the `pathFileMapping` property of `config.user.ts`.

    For example:

    ```
    https://provider1.example.com/api/patients/1/records/sample.json
    ```
    Becomes:

    <pre><code><span id="urlOrigin">&lt;rootUrl&gt;</span>/https%3A%2F%2Fprovider1.example.com%2Fapi%2Fpatients%2F1%2Frecords%2Fsample.json</code></pre>

Logs are output or persisted as specified in the `reportOutputs` property of `config.user.ts`.

When collecting and providing evidence, set `reportOutputs.reportsDir` to `true`, run the tests as specified, and send the JSON output as evidence.

JSON logs can be viewed in human-readable format by running `ts-node pretty-html <fileName>`. <!-- TODO -->

<!-- <div class="message is-warning">
<div class="message-body" markdown="1">
**Note**: [note]
</div>
</div> -->

<!-- <div class="notice" markdown="1">

abc

</div> -->

## Configuration options

Various configuration options are available in `config.user.ts`:

Property                   | Type                         | Details
------------------         | ---------------------------  | ------------------------------
`endpointFormat`           |  `"local" \| "integration"`  | If `endpointFormat` is `"local"`, endpoints are constructed as if the root is the SSP URL, i.e. the Provider URL must be percent-encoded and appended to the root. Provider URLs are as configured in the `pathFileMapping` property.
`useFhirMimeTypes`         | `boolean`                    | If `true` (default), MIME types of JSON and XML responses will be set to `application/fhir+json` and `application/fhir+xml` respectively.
`explicitlySetUtf8`        | `boolean`                    | Append `;charset=utf-8` to MIME types.
`port`                     | `number`                     | The port over which to serve the test app.
`reportOutputs.stdout`     | `boolean`                    | Show report output in real-time in the terminal.
`reportOutputs.reportsDir` | `boolean`                    | Save reports as JSON files in `/reports` directory.
`logBodyMaxLength`         | `number`                     | Maximum chars of response body to log, after which the body will be truncated.<br>• `-1` logs the entire response body.<br>• `0` logs no response body.
`pathFileMapping`          | `{ [path: string]: string }` | To add records to test against, place the files in the `/responses` directory, and add a mapping for each to this property.<br><br>If `endpointFormat` is `local`, the key of each mapping must be a valid URL, but it doesn&rsquo;t have to point to anything.

<!-- `mode`                     | `"guided" \| "exploratory"`  | In guided mode, instructions are provided in the CLI prompt regarding which endpoints to hit. Reports are generated once all endpoints have been hit (indicated when "Finished" is displayed in the terminal).<br><br>In exploratory mode, the test app runs continually and generates reports for any/all calls made.
 -->
 