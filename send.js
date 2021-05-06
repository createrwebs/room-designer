'use strict';

const Client = require('ssh2-sftp-client');

const config = {
    host: 'sftp.sd5.gpaas.net',
    username: '4334150',
    password: 'KN8F2UYemKudSiU'
};

const sftp = new Client('example-client');
let localFile = "./dist/main.bundle.js";
let remoteFile = '/lamp0/web/vhosts/preprod.kinoki.fr/htdocs/minet3d/wp-content/themes/minet3d_2021/main.bundle.js';

sftp.connect(config)
    .then(() => {
        return sftp.cwd();
    })
    .then(() => {
        console.log("send", localFile)
        return sftp.fastPut(localFile, remoteFile);
    })
    .then(() => {
        return sftp.end();
    })
    .catch(err => {
        console.log(`Error: ${err.message}`); // error message will include 'example-client'
    });