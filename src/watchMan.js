const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

class WatchMan {

    init
    child;
    last_time;

    timeout;

    addCommand(command) {
        this.command = command;
    }

    fork() {
        let now = Date.now();

        if (this.child) {
            this.child.kill();
        }
        if (now - this.last_time < 500) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            if (this.init) {
                console.log("\x1b[31m%s\x1b[0m", "<<--------------reloading------------->>")
            }
            this.child = childProcess.fork(this.command);
            if (!this.init) this.init = true;
        }, 500)

        this.last_time = now;
    }

    start() {
        fs.watch(__dirname, {recursive: true}, (event,fileName) => {
            if (this.child) {
                console.log(event,fileName);
                this.fork();
            }
        })

        this.fork();
    }
}


let man = new WatchMan();

man.addCommand(path.join(__dirname, 'app.js'));
man.start();