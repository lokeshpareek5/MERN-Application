const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');

// @Route POST api/posts
// desc Create a post
// @access Private 
router.post('/', [ auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // console.log(req);
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        return res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @Route GET api/posts
// desc Get all post
// @access Private 
router.get('/', auth, async (req, res) => {
    try {
       const posts = await Post.find().sort({date: -1});
       res.json(posts); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @Route GET api/posts/:id
// desc Get post by ID
// @access Private 
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            res.status(404).json({ msg: 'Post not found'});
        }
        res.json(post);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            res.status(404).json({ msg: 'Post not found' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @Route DELETE api/posts/:id
// desc Delete post by ID
// @access Private 
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ msg: 'Post not found' });
        }
        //check user
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized'});
        }
        await post.remove();
        res.json({ msg: 'Post removed'});
    } catch (err) {
        if (err.kind === 'ObjectId') {
            res.status(404).json({ msg: 'Post not found' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @Route PUT api/posts/like/:id
// desc Like a post
// @access Private 
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //if post is already liked
        if(
            post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg:'Post already liked' });
        }

        post.likes.unshift({user: req.user.id});
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @Route PUT api/posts/unlike/:id
// desc UnLike a post
// @access Private 
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        console.log(post);
        //if post is already liked
        if (
            post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        }

        //Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @Route POST api/posts/comment/:id
// desc Comment on a post
// @access Private 
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);
        await post.save();
        return res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @Route DELETE api/posts/comment/:id/:comment_id
// desc Delete a comment
// @access Private 
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // pull out the comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        // Make sure comment is exists
        if(!comment) {
            res.status(400).json({ msg: 'Comment does not exist'});
        }

        //Check user
        if(comment.user.toString() !== req.user.id) {
            res.status(401).json({ msg: 'User is not authorized'});
        }
        // Get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();

        res.json(post.comments);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;