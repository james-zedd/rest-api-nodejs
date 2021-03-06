const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const blogController = require('../controllers/blog');

// GET /blog
router.get('/', blogController.getItems);

// POST /blog/createItem
router.post('/createItem', [
  body('title')
    .trim()
    .isLength({ min: 5 }),
  body('content')
    .trim()
    .isLength({ min: 5 })
], blogController.postCreateItem);

// GET /blog/:itemId
router.get('/:itemId', blogController.getBlogItem)

// PUT /blog/:itemId
router.put('/:itemId', [
  body('title')
    .trim()
    .isLength({ min: 5 }),
  body('content')
    .trim()
    .isLength({ min: 5 })
], blogController.putBlogItem);

// DELETE /blog/:itemId
router.delete('/:itemId', blogController.deleteBlogItem);

module.exports = router;