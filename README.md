## rsync-slim

Slim wrapper around rsync.  
Use rsync options as on the command line.

### Prerequisites

rsync needs to be installed on your machine. Or cwRsync on Windows.

<!---
### Installation

```
npm install rsync-slim --save-dev
```
-->

### Examples


#### Basic:

```js
var rsync = require('rsync-slim');

rsync({
  src: ['index.html', 'css', 'img'],
  dest: 'user@domain.com:/path/on/server',
  options: '-rtvhcz --delete --progress'
});
```


#### In a gulp task:

```js
var rsync = require('rsync-slim');

gulp.task('deploy', function() {
  var secrets = require('./secrets.json');

  rsync({
    src: 'build',
    dest: secrets.rsync.dest,
    options: '-rtvhcz --delete --progress',
    log: require('gulp-util').log
  });
});
```
with a file `secrets.json` like:
```json
{
  "rsync": { "dest": "user@domain.com:/path/on/server" }
}
```
which you can keep private by adding a line `secrets.json` to the file `.gitignore`.


#### Variations:
```js
rsync({
  ....
  log: true,   // Will use console.log for logging.
  sync: false  // Launches rsync in async process; script doesn't wait.
},
  function(err) {  // Custom callback function.
    console.log(err);
  }
);
```


### API

`rsync(settings, callback)` :

- `settings` :

  - `src` (Array|String), required :  
     an array or space-separated string of source files and folders.

  - `dest` (String), required :  
    the destination server+path.

  - `options` (Object) :  
     the raw rsync-command options.
  
  - `log` (Boolean|Function) :  
     If `true`, the generated rsync-command will be sent to `console.log`.  
     If it is a function, then it will be called with this command as String argument.

  - `sync` (Boolean), default=`true` :  
    Tells whether to launch rsync synchronously (`true`) and wait for it to finish,  
    or in an asynchronous process (`false`).

  - `stdio` (String|Array), default=`'inherit'` :  
     The child process's input/output configuration. Is passed on as `stdio` option to [`child_process`](https://nodejs.org/api/child_process.html "NodeJS child_process documentation").`spawn`/`spawnSync`.

- `callback(err)` :

  is called when rsync finishes. `err` is `null` on success, else an `Error` object.

  If no callback is given and rsync finishes with an error, then an `Error` object is `throw`n instead.


### Tips
- For Windows clients using cwRsync:

  Create a batch-file `rsync.bat` that sets cwRsync's required environment-variables, and put it in a location included in your PATH:
  ```dos
  @echo off
  setlocal
  set RSYNC_HOME=%PROGRAMFILES%\cwRsync
  set HOME=%USERPROFILE%
  set PATH=%RSYNC_HOME%;%PATH%
  rsync %*
  ```

- cwRsync accepts absolute paths like `/cygdrive/c/path/to/source` instead of `C:\path\to\source`.
