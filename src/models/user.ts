import { model, models, ObjectId, Schema, Types, Document, Model, isValidObjectId } from 'mongoose';

export interface IUser {
    _id?: Schema.Types.ObjectId;
    userId: string;
    updatedAt: Date;
    createdAt: Date;
}

interface IVirtuals extends Model<IUser> {}

interface IMethods extends Document {
}

export interface UserModel extends Model<IUser, {}, IMethods, IVirtuals> {
    user(userId: string): Promise<IUser>;
}

// * Schema

export const userSchema = new Schema<IUser, UserModel, IMethods>({
    userId: { type: String, required: true },
}, { versionKey: false, timestamps: true });


// * Methods


// * Statics
userSchema.statics.user = async function(userId: string) {
    if (userId.length !== 18 || isNaN(Number(userId))) return new Error('Not valid userId');

    const user = await this.findOne({ userId });

    if (user) return user.toJSON();
    else {
        const newUser = new this({
            userId
        });

        newUser.save();

        return newUser.toJSON();
    }
}

// * Pre


// *

export default <UserModel>(models.users as any || model('users', userSchema));