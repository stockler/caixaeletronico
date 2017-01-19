'use strict';

import mongoose from 'mongoose';
import db from '../libs/db';

const Schema = mongoose.Schema;

const AtmSchema = new Schema({
    name: String,
    qtd: Number
});

export default db.model('Atm', AtmSchema);