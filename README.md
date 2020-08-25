# NRL Responder Stub

This is the developer documentation. For user documentation, see [docs](./lib/docs.md).

===

The NRL Responder Stub is intended for NRL Consumers to carry out conformance testing of their record retrieval capabilities, during local and INT stages of testing.

## Development (Windows)

### Setup

1. Install [NodeJS](https://nodejs.org/en/download/) ≥ v10.x.x
1. Run `npm i`
   
   **Note:** This will also globally install `ts-node`, which is required to run the app.

### Run in Development Mode

Windows (cmd):
```
start-dev.bat
```

Linux (bash):
```
./start-dev.sh
```

### Test with Postman/Newman

_While app is running in another terminal instance:_

`npm run newman`

### Create a Production Build

`npm run build`

This creates a build in the `dist` subdirectory, which can then be compressed to a zip archive and released.

### Create Docker Image

1. `npm run build`
1. `docker build -t <TAG NAME> .`

To run:

`docker run -p 8080:5000 <TAG NAME>:latest`
