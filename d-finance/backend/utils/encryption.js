const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
const iv = crypto.randomBytes(16);

exports.encrypt = (text) => {
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

exports.decrypt = (text) => {
  let [ivPart, encryptedPart] = text.split(':');
  let decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivPart, 'hex'));
  let decrypted = decipher.update(encryptedPart, 'hex', 'utf8');
  return decrypted + decipher.final('utf8');
};