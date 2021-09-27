'use strict';
const Client = require('ssh2-sftp-client');
const sftp = new Client('example-client');

/*
https://minet3d.kinoki.fr/                  dev/preprod
https://kinotools.kinoki.fr/minet3d/        recette
https://meublesminet.com/3d-dressing/       prod


dev/preprod
http://minet3d.kinoki.fr/
WP:
minet3d_fab
fab
*/
const configPreprod = {
    host: 'sftp.sd5.gpaas.net',
    username: '4334150',
    password: 'KN8F2UYemKudSiU',
    remoteFile: 'vhosts/minet3d.kinoki.fr/htdocs/wp-content/themes/minet3d_2021/main.bundle.js'
};
const configProduction = {
    host: '54.37.227.177',
    username: 'www-kinoki-kinotools',
    password: 'Jv0s5Jjfmsvv',
    remoteFile: '/var/www/kinoki/kinotools/prod/htdocs/minet3d/wp-content/themes/minet3d_2021/main.bundle.js'
};
const config = configPreprod
const localFile = "./dist/main.bundle.js";

sftp.connect(config)
    .then(() => {
        return sftp.cwd();
    })
    .then(() => {
        console.log("send", localFile, " to ", config.remoteFile)
        return sftp.fastPut(localFile, config.remoteFile);
    })
    .then(() => {
        return sftp.end();
    })
    .catch(err => {
        console.log(`Error: ${err.message}`);
    });