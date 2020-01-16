@ECHO OFF

REM https://superuser.com/a/498798

REM Bypass "Terminate Batch Job" prompt.
IF "%~1"=="-FIXED_CTRL_C" (
   REM Remove the -FIXED_CTRL_C parameter
   SHIFT
) ELSE (
   REM Run the batch with <NUL and -FIXED_CTRL_C
   CALL <NUL %0 -FIXED_CTRL_C %*
   GOTO :EOF
)

CALL npm i --silent --no-progress > NUL

FOR /F "tokens=* USEBACKQ" %%F IN (`ts-node ".\get-ca-file"`) DO (
    IF NOT "%%F" == "null" SET NODE_EXTRA_CA_CERTS=%%F
)

CALL ts-node ".\src\main"
