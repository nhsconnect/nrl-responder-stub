const path = require('path');
const fs = require('fs');

const { dependencies } = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, '..', 'package.json'), 'utf8'
    ));

const installRequired = () => {
    const deps = Object.keys(dependencies);

    while (deps.length) {
        try {
            require.resolve(deps.shift());
        } catch (_e) {
            return true;
        }
    }

    return false;
}

const progressMessage = {
    messages: [],

    start: function (key, text, std) {
        if (!std.clearLine) { // prevent errors in git-bash on Windows
            return console.log(`${text}...`);
        }

        const PROGRESS_BAR_LENGTH = 20;

        const msg = {
            text,
            progress: 1,
        };

        msg.interval = setInterval(() => {
            const msgPadding = '.'.repeat(msg.progress);

            std.clearLine();
            std.cursorTo(0);
            std.write(`\x1b[35m${msg.text}\x1b[33m${msgPadding}\x1b[0m`);

            msg.progress++;

            if (msg.progress > PROGRESS_BAR_LENGTH) {
                msg.progress = 0;
            }

        }, 500);

        this.messages[key] = msg;
    },

    stop: function (key, std) {
        if (!std.clearLine) { // prevent errors in git-bash on Windows
            return;
        }

        const { interval } = this.messages[key];
        
        clearInterval(interval);

        std.clearLine();
        std.cursorTo(0);

        delete this.messages[key];
    },
};

if (installRequired()) {
    progressMessage.start('depInstaller', 'Installing Dependencies', process.stdout);

    require('child_process').exec(`npm install ${process.env.NODE_ENV === 'production' ? '--production ' : ''}--loglevel=error`, (error, _stdout, stderr) => {
        progressMessage.stop('depInstaller', process.stdout);

        if (error || stderr) {
            process.stdout.write('\x1b[31mFailed to install dependencies. Conformance tests can\'t run.\x1b[0m');
            process.stdout.write('\n\n');

            process.exit();
        }
    });
}
