const express = require('express');
const AVLTree = require('../avl/AVLTree');

const router = express.Router();
const tree = new AVLTree();

// Insert a node
router.post('/insert', (req, res) => {
  const { value } = req.body;
  const result = tree.insert(value);
  res.json(result);
});

// Delete a node
router.delete('/delete/:value', (req, res) => {
  const value = parseInt(req.params.value);
  const result = tree.delete(value);
  res.json(result);
});

// Get current tree structure
router.get('/tree', (req, res) => {
  res.json(tree.getTree());
});

// Get theoretical height (log(n))
router.get('/height', (req, res) => {
  const height = tree.getHeightLogN();
  res.json({ height });
});


module.exports = router;
