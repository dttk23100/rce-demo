const { exec } = require("child_process");

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  const host = String(req.query.host || "example.com").slice(0, 300);
  const started = Date.now();

  // Deliberately vulnerable: user input is interpolated into a shell command.
  const cmd = `printf 'Resolving %s...\\n' ${host}; getent hosts ${host} || true`;

  exec(cmd, { timeout: 6000, shell: "/bin/sh" }, (err, stdout, stderr) => {
    res.status(200).json({
      host,
      command: cmd,
      code: err && typeof err.code === "number" ? err.code : 0,
      timedOut: !!(err && err.killed),
      output: String(stdout || "") + String(stderr || ""),
      ms: Date.now() - started,
    });
  });
};
