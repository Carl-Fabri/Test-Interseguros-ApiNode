/**
 * Punto de entrada de api-node (Node.js + Express 5): valida la configuración,
 * levanta el servidor y lo apaga de forma ordenada ante SIGINT/SIGTERM.
 */
const { loadConfig } = require('./config');
const { createApp } = require('./app');

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const server = createApp(config).listen(config.port, () => {
  console.log(`api-node escuchando en el puerto ${config.port}`);
});

// Apagado ordenado: termina las peticiones en curso antes de salir (p. ej. en un redeploy).
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`${signal} recibido, apagando api-node`);
    server.close(() => process.exit(0));
  });
}
