'use strict';

import mongoose from 'mongoose';
import Promise from 'bluebird';

//const uri = 'mongodb://testuser:TestUser#@ds163718.mlab.com:63718/caixaeletronicotest';
const uri = 'mongodb://PCALP128';
const db = mongoose.connect(uri);

db.Promise = Promise;

export default db;



