@ECHO OFF

:: https://superuser.com/a/498798

:: Bypass "Terminate Batch Job" prompt.
IF "%~1"=="-FIXED_CTRL_C" (
   :: Remove the -FIXED_CTRL_C parameter
   SHIFT
) ELSE (
   :: Run the batch with <NUL and -FIXED_CTRL_C
   CALL <NUL %0 -FIXED_CTRL_C %*
   GOTO :EOF
)

SET NODE_ENV=production

CALL node ".\src\install-dependencies"

FOR /F "tokens=* USEBACKQ" %%F IN (`node ".\get-ca-file"`) DO (
    IF NOT "%%F" == "null" SET NODE_EXTRA_CA_CERTS=%%F
)

CALL node ".\src\main"
