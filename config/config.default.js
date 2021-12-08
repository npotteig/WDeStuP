'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Add/overwrite any additional settings here
const mongoHost = process.env.MONGO_HOST || '127.0.0.1';
config.mongo.uri = `mongodb://${mongoHost}:27017/webgme_dcrypps`;
config.plugin.allowServerExecution = true;

config.seedProjects.defaultProject = 'PetriNet';

config.requirejsPaths['jointjs'] = './node_modules/jointjs/dist/joint.min';
config.requirejsPaths['lodash'] = './node_modules/lodash/lodash.min';
config.requirejsPaths['jointjscss'] = './node_modules/jointjs/dist/joint';
config.requirejsPaths['dagrejs'] = './node_modules/dagre/dist/dagre.min';
config.requirejsPaths['graphlibjs'] = './node_modules/graphlib/dist/graphlib.min';

validateConfig(config);
module.exports = config;
