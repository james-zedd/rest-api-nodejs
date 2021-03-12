const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const blogController = require('../controllers/blog');
const isAuth = require('../middleware/is-auth');

// GET /blog
router.get('/', isAuth, blogController.getItems);

// POST /blog/createItem
router.post('/createItem', isAuth, [
  body('title')
    .trim()
    .isLength({ min: 5 }),
  body('content')
    .trim()
    .isLength({ min: 5 })
], blogController.postCreateItem);

// GET /blog/:itemId
router.get('/:itemId', isAuth, blogController.getBlogItem)

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
router.delete('/:itemId', isAuth, blogController.deleteBlogItem);

module.exports = router;