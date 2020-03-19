import crypto from 'crypto';
import RoleToResource from '../models/RoleToResource/roleToResource';
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);


exports.encrypt = (text) => {
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

exports.decrypt = (text) => {
 let iv = Buffer.from(text.iv, 'hex');
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}
exports.findResource = async function(params){
    try {
        return await RoleToResource.find(params)
    }
    catch(err) {
        console.log(err)
    }
}

export const BASEURL = "http://localhost:5000"
// http://178.62.55.64/