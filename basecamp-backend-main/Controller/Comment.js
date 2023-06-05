import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const createComment = async(req, res) => {   
    try {
        const { postId, comment } = req.body

        if(!comment) return res.json({message: 'Comment is empty'});

        const newComment = new Comment({ comment, author: req.userId });
        await newComment.save();

        try {
            await Post.findByIdAndUpdate(postId, {
                $push: { comments: newComment._id}
            })
        } catch (e) {
            console.log(e);
        }

        res.json(newComment);
    } catch (e) {
        console.log(e);
        res.status(400).json({
        message: 'Error with comment'
      });
    }
}