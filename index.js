var cp = require('child_process');


module.exports = function(o, cb) {


  // --- Prepare.

  // Source path(s) can be given as array or space-separated string.
  var src = o.src;
  if(Array.isArray(src))  src = src.join(' ');

  var options = o.options || '';
  
  var win = 'win32' === process.platform;

  // If ssh is a only filename without path then prepend the user's home folder + '/.ssh'.
  // On Windows, convert to a cygwin-type filepath, e.g. '/cygdrive/c/Users/x/.ssh/sshAuthFile"',
  var ssh = o.ssh || '';
  if (ssh) {
    if (ssh.indexOf('\\') < 0  &&  ssh.indexOf('/') < 0) {
      ssh = process.env[win ? 'USERPROFILE' : 'HOME'] + '/.ssh/' + ssh;
    }
    ssh = ssh
      .replace(/^([a-zA-Z]):\\/, function (a, d){
        return '/cygdrive/' + d.toLowerCase() + '/';
      })
      .replace(/\\/g, '/');
    ssh =  '-e "ssh -i ' + ssh + '"';
  }

  var command = ['rsync', options, ssh, src, o.dest]
    .filter(function (s) {return s;})
    .join(' ');
  
  // Log the generated rsync command via console.log or a custom log-function.
  if (o.log) {
    if (typeof(o.log) != 'function')  o.log = console.log;
    o.log('Command: ' + command);
  }
  
  // Only when o.sync is explicitly set to false, run rsync asynchronously.
  // Else if o.sync is undefined or true, use synchronous spawnSync().
  var sync = o.sync !== false;
  spawn = sync ? cp.spawnSync : cp.spawn;

  var stdio = o.stdio || 'inherit';



  // --- Launch rsync.

  var r;
  if (win) {
    r = spawn('cmd.exe', ['/s', '/c', '"' + command + '"'], {
      windowsVerbatimArguments: true,
      stdio: stdio,
      env: process.env
    });
  }
  else {
    r = spawn('/bin/sh', ['-c', command], {
      stdio: stdio,
      env: process.env
    });
  }



  // --- Handle callback/errors.

  var cbWrap = function(code) {
    var er = code === 0 ? null: new Error('rsync exited with code ' + code);

    if (cb)       // Report OK or possible error via callback.
      cb(er);
    else if (er)  // If no callback given, but error, then throw the error.
      throw er;
  }

  if (sync)  cbWrap(r.status)
  else  r.on('exit', cbWrap);

}
