import { model, models, ObjectId, Schema, Types, Document, Model, PopulatedDoc } from 'mongoose';

import { IUser } from './user';

export interface IVisit {
    seconds: number;
    joinedAt: Date;
    leavedAt: Date;
}

export interface IVoice {
    _id?: Schema.Types.ObjectId;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    voiceId: string;
    visits: Array<IVisit>;
    updatedAt: Date;
    createdAt: Date;
}

interface IVirtuals extends Model<IVoice> {}

interface IMethods extends Document {
}

export interface VoiceModel extends Model<IVoice, {}, IMethods, IVirtuals> {}

// * Schema

export const visitSchema = new Schema<IVisit>({
    seconds: { type: Number, required: true, default: 0 },
    joinedAt: { type: Date, required: true },
    leavedAt: { type: Date, required: true }
}, { _id: false, versionKey: false });

export const voiceSchema = new Schema<IVoice, VoiceModel, IMethods>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    voiceId: { type: String, required: true },
    visits: { type: [visitSchema] }
}, { versionKey: false, timestamps: true });


// * Methods


// * Pre


// *

export default <VoiceModel>(models.voices as any || model('voices', voiceSchema));