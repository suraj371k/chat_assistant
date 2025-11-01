import mongoose, { Schema } from 'mongoose';
const messageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true,
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
// Index for faster message retrieval
messageSchema.index({ conversationId: 1, createdAt: 1 });
export default mongoose.model('Message', messageSchema);
