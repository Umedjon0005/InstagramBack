import PostModel from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const getLastTags = async (req, res) => {
    try {
      const posts = await PostModel.find().limit(5).exec();
  
      const tags = posts
        .map((obj) => obj.tags)
        .flat()
        .slice(0, 5);
  
      res.json(tags);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: 'Не удалось получить тэги',
      });
    }
};

export const getAll = async (req, res) => {
    try{
        const posts = await PostModel.find().populate('user').exec();

        res.json(posts);
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи',
        });
    }
}

export const create = async (req, res) => {
    try{
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags.split(','),
            user: req.userId
        });

        const post = await doc.save();

        try {
            await User.findByIdAndUpdate(req.userId, {
                $push: { posts: post._id }
            })
        } catch (e) {
            console.log(e);
        }

        res.json(post);
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать статью',
        });
    }
};

export const getOne = async (req, res) => {
    try{
        const postId = req.params.id;

        const doc = await PostModel.findOneAndUpdate({
            _id: postId,
        }, {
            $inc: { viewsCount: 1 },
        },
        {
            returnDocument: 'after',
        }
    ).populate('user').then((doc) => res.json(doc))
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи',
        });
    })

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи',
        });
    }
};

export const remove = async (req, res) => {
    try{
        const postId = req.params.id;
        PostModel.findOneAndDelete({
            _id: postId,
        })
        .then(doc => res.json(doc))
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Не удалось удалить статью'
            });
        });

        try {
            await User.findByIdAndUpdate(req.userId, {
                $pull: { posts: postId }
            })
        } catch (e) {
            console.log(e);
        }

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи',
        });
    }
};

export const update = async (req, res) => {
    try {
        const postId = req.params.id;

        await PostModel.updateOne({
            _id: postId
        }, 
        {
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            user: req.userId,
            tags: req.body.tags.split(','),
        });

        res.json({
            success: true,
        })
    }   

    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось обновить статью',
        });
    }
}

export const getPostComments = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id)
        const list = await Promise.all(
            post.comments.map((comment) => {
                return Comment.findById(comment)
            }),
        )
        res.json(list)
    } catch (error) {
        res.json({ message: 'Что-то пошло не так.' })
    }
}

export const getMyPosts = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const list = await Promise.all(
            user.posts.map(post => {
                return PostModel.findById(post._id)
            })
        )

        res.json(list)
    } catch (error) {
        res.json({ message: 'Что-то пошло не так.' })
    }
}