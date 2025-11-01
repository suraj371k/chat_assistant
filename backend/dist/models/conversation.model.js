import mongoose, { Schema } from 'mongoose';
const conversationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        default: 'New Chat',
        trim: true,
    },
}, {
    timestamps: true,
});
// Index for faster queries
conversationSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model('Conversation', conversationSchema);
