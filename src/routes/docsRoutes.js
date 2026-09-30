/**
 * Documentación de la API: contrato OpenAPI en /openapi.yaml y referencia interactiva (Scalar) en /docs.
 */
const path = require('node:path');
const express = require('express');

const OPENAPI_DIR = path.join(__dirname, '..', '..', 'openapi');

function docsRoutes() {
  const router = express.Router();

  router.get('/openapi.yaml', (req, res) => {
    res.type('application/yaml').sendFile(path.join(OPENAPI_DIR, 'openapi.yaml'));
  });
  router.get('/docs', (req, res) => {
    res.sendFile(path.join(OPENAPI_DIR, 'docs.html'));
  });

  return router;
}

module.exports = { docsRoutes };
