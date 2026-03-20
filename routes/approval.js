const express = require('express');

const router = express.Router();

const getAgentBaseUrl = () => {
  const value = (process.env.AGENT_BASE_URL || 'http://localhost:3000').trim();
  return value.replace(/\/$/, '');
};

router.get('/approve/:id', (req, res) => {
  const { id } = req.params;
  const target = `${getAgentBaseUrl()}/approve/${id}`;
  res.redirect(302, target);
});

router.get('/reject/:id', (req, res) => {
  const { id } = req.params;
  const target = `${getAgentBaseUrl()}/reject/${id}`;
  res.redirect(302, target);
});

module.exports = router;
