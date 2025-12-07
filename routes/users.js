var express = require('express');
var db = require('../db')
var router = express.Router();
var { usersTable } = require('../src/db/schema');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  const result = await db.select().from(usersTable);
  res.json(result);
});

module.exports = router;
