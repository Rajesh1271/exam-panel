const express = require('express');
const router = express.Router();
const securityCtrl = require('../controller/securitycontroller');

// Anti-Cheat Logging
router.post('/log-violation', securityCtrl.logViolation);

// Security Monitor Telemetry
router.get('/monitor', securityCtrl.getSecurityMonitor);

// Clear logs
router.delete('/clear', securityCtrl.clearSecurityLogs);

module.exports = router;
