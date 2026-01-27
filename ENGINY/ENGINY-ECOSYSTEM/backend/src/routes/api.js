const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const workshopRoutes = require('./workshopRoutes');
const requestRoutes = require('./requestRoutes');
const sessionRoutes = require('./sessionRoutes');

router.use('/auth', authRoutes);
router.use('/workshops', workshopRoutes);
router.use('/requests', requestRoutes);
router.use('/sessions', sessionRoutes);

module.exports = router;