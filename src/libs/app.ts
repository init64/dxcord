import { Application, MongooseProvider, MetaDataTypes, MapProvider } from 'discord-linked-roles';
import { RESTGetAPIUserResult } from 'discord-api-types/v10'

import dotenv from 'dotenv';

dotenv.config();

const { ID, SECRET, REDIRECT_URI, TOKEN, MONGO_URI } = process.env;

export type DataBaseProvider = {
    findAll(): Promise<{tokens: OAuthTokens, id: string}>;
    // Gets the token for the user
    fetchUser: (userId: string) => Promise<OAuthTokens | undefined>;
    createOrUpdate: (userId: string, token: OAuthTokens) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
}

export interface OAuthTokens {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

const application = new Application({
    id: ID,
    token: TOKEN,
    clientSecret: SECRET,
    redirectUri: REDIRECT_URI,
    scopes: ['identify', 'role_connections.write'],
    databaseProvider: (MONGO_URI ? new MongooseProvider(MONGO_URI) : new MapProvider()) as any
});

export function register() {
    application.registerMetaData([
        {
            key: 'level',
            name: 'Level',
            description: 'The level of the user',
            type: MetaDataTypes.INTEGER_GREATER_THAN_OR_EQUAL as any
        },
        {
            key: 'xp',
            name: 'Total XP',
            description: 'The total xp of the user',
            type: MetaDataTypes.INTEGER_GREATER_THAN_OR_EQUAL as any
        }
    ]);
}

interface IMetaData {
    platform_name: string;
    platform_username: string | null;
    metadata: {
        level: string;
        xp: string;
    }
}

export async function levelUp(userId: string, name: string) {
    let metadata = (await application.getUserMetaData(userId) as IMetaData).metadata,
        xp = Number(metadata.xp),
        level = Number(metadata.level),
        plusXp = Number((Math.random() * Date.now()).toFixed(3).split('.')[1]),
        isXp = (xp + plusXp) >= ((level + 1) * (((level + 1) * 12) * 24));
    
    application.setUserMetaData(userId, name, {
        level: String(level + (isXp ? 1 : 0)),
        xp: String(isXp ? 0 : xp + plusXp)
    });
}

export default application;