const crypto  = require('crypto')
module.exports = (userName, secretKey, utime) => {
    const accessString = `TransmitSMS ${userName} ${secretKey} ${utime}`;
    return crypto.createHash('md5').update(accessString).digest('hex');
}
