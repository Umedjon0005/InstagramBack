import express  from "express";
import mongoose from "mongoose";
import fs from 'fs';
import multer from 'multer';
import { registerValidation, loginValidation,  postCreateValidation} from "./validation/validations.js";
import { UserController, PostController, Comment } from "./Controller/index.js";
import cors from 'cors';
import { handleValidationErrors, checkAuth } from "./utils/index.js";

const port = process.env.PORT || 4444;

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('DB ok'))
    .catch((err) => console.log('DB error', err));

    const app = express();

    const storage = multer.diskStorage({
      destination: (_, __, cb) => {
        if (!fs.existsSync('uploads')) {
          fs.mkdirSync('uploads');
        }
        cb(null, 'uploads');
      },
      filename: (_, file, cb) => {
        cb(null, file.originalname);
      },
    });
    
    const upload = multer({ storage });
    
    app.use(express.json());
    app.use(cors());
    app.use('/uploads', express.static('uploads'));
    app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
    app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
    app.get('/auth/me', checkAuth, UserController.getMe);
    app.get('/all', checkAuth ,UserController.getAll)
    app.get('/oneUser/:id', checkAuth, UserController.getOneUser)
    app.put('/follow/:id', checkAuth, UserController.getFollow);
    app.put('/unfollow/:id', checkAuth, UserController.getUnFollow);
    app.patch('/user/:id', checkAuth, registerValidation, handleValidationErrors, UserController.updateUser);
    
    app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
      res.json({
        url: `/uploads/${req.file.originalname}`,
      });
    });
    
    app.get('/tags', PostController.getLastTags);
    
    app.get('/posts', PostController.getAll);
    app.get('/posts/tags', PostController.getLastTags);
    app.get('/posts/:id', PostController.getOne);
    app.get('/auth/posts/user/me/:id', checkAuth ,PostController.getMyPosts);
    app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
    app.delete('/posts/:id', checkAuth, PostController.remove);
    app.post('/auth/comments/:id', checkAuth, Comment.createComment);
    app.get('/auth/posts/comments/:id', PostController.getPostComments);
    app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

app.listen(port, (err) => {
    if(err) {
        return console.log(err);
    }

    console.log('Server OK');
}); 

//'mongodb+srv://admin:wwwwww@cluster0.x6dpnsk.mongodb.net/instagram?retryWrites=true&w=majority'