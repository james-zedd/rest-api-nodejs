const { validationResult } = require('express-validator');
const BlogPostModel = require('../models/blogItem');
const { post } = require('../routes/blog');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');

exports.getItems = (req,res, next) => {
  const currentPage = req.query.page || 1;
  const itemsPerPage = 2;
  let totalItems;
  BlogPostModel.find().countDocuments()
    .then(count => {
      totalItems = count;
      return BlogPostModel.find()
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);
    })
    .then(items => {
      res.status(200).json({ message: "Fetched posts successfully", posts: items, totalItems: totalItems });
    })
    .catch(err => {
      if(!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postCreateItem = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const blogItem = new BlogPostModel({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  blogItem.save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(blogItem);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully',
        blogItem: blogItem,
        creator: {_id: creator._id, name: creator.name}
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
};

exports.getBlogItem = (req, res, next) => {
  const itemId = req.params.itemId;
  BlogPostModel.findById(itemId)
    .then(item => {
      if (!item) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched', item: item })
    })
    .catch(err => {
      if(!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.putBlogItem = (req, res, next) => {
  const itemId = req.params.itemId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (req.file) {
    imageUrl = req.file.path;
  } 
  if (!imageUrl) {
    const error = new Error('No file picked');
    error.statusCode = 422;
    throw error;
  }
  BlogPostModel.findById(itemId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized to update this!');
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Post updated', post: result })
    })
    .catch(err => {
      if(!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.deleteBlogItem = (req, res, next) => {
  const itemId = req.params.itemId;
  BlogPostModel.findById(itemId)
    .then(item => {
      if (!item) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      if (item.creator.toString() !== req.userId) {
        const error = new Error('Not authorized to delete this!');
        error.statusCode = 403;
        throw error;
      }
      // Check logged in user
      clearImage(item.imageUrl);
      return BlogPostModel.findByIdAndDelete(itemId);
    })
    .then (result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(itemId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Blog item deleted.' });
    })
    .catch(err => {
      if(!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

const clearImage = filePath => {
  fileLocation = path.join(__dirname, '../', filePath);
  fs.unlink(fileLocation, err => console.log(err));
}