import mongoose, { type Mongoose } from 'mongoose';

import { $log } from './logs';

export default class DataBase {
    private uri: string;
    private db: Mongoose;

    constructor(uri: string = 'mongodb://0.0.0.0/dxcord') {
        this.uri = uri;

        this.db = mongoose;
    }

    connect() {
        return this.db.connect(this.uri)
            .then(db => $log.setOptions({ title: 'MongoDB' }).log(`Connected \x1b[4m\x1b[36m${db.connections[0].name}\x1b[0m`))
            .catch(err => $log.setOptions({ type: 'error' }).log(err));
    }
}