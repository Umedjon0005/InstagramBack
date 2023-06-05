import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    avatarUrl: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }, {
        timestamps: true,
    }
);

export default mongoose.model('User', UserSchema);