import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';
import Post from '../models/Post.js';

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось зарегистрироваться',
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Неверный логин или пароль',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};

export const getAll = async (req, res) => {
  try { 
    const user = await UserModel.find();

    res.json(user);
  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: 'No user',
    });
  }
} 

export const getOneUser = async (req, res) => {
  try { 
    const userId = req.params.id
    const doc = await UserModel.findOneAndUpdate({
      _id: userId,
      },
      {
          returnDocument: 'after',
      }
    ).then((doc) => res.json(doc))
    .catch(err => {
      console.log(err);
      res.status(500).json({
          message: 'User not found',
      });
    })

  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: 'No user',
    });
  }
}

export const getFollow = async (req, res) => {
  try {

    const follow = await UserModel.findByIdAndUpdate(req.body.followId, {
        $push: {followers: req.userId}
     });

    await UserModel.findByIdAndUpdate(req.userId, {
        $push: {following: req.body.followId}
     });

     res.json(follow)
  } catch (e) {
    console.log(e)
  }
}

export const getUnFollow = async (req, res) => {
  try {

    const follow = await UserModel.findByIdAndUpdate(req.body.unfollowId, {
        $pull: {followers: req.userId}
     });

    await UserModel.findByIdAndUpdate(req.userId, {
        $pull: {following: req.body.unfollowId}
     });

     res.json(follow)
  } catch (e) {
    console.log(e)
  }
}

export const updateUser = async (req, res) => {
  try {
      const userId = req.params.id;

      await UserModel.updateOne({
          _id: userId
      }, 
      {
        email: req.body.email,
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl
      });

      res.json({
          success: true,
      })
  }   

  catch (err) {
      console.log(err);
      res.status(500).json({
          message: 'Cannot update user',
      });
  }
}