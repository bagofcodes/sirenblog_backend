const S3 = require("aws-sdk/clients/s3");
const fs =require("fs");
require("dotenv").config();

const AWSBUCKETNAME = process.env.AWSBUCKETNAME;
const AWSBUCKETREGION = process.env.AWSBUCKETREGION;
const AWSACESSKEY = process.env.AWSACESSKEY;
const AWSSECRETKEY = process.env.AWSSECRETKEY;

const s3= new S3({
    region: AWSBUCKETREGION,
    accessKeyId: AWSACESSKEY,
    secretAccessKey: AWSSECRETKEY
});


function uploadFile(filepath,filename){
    const filestream = fs.createReadStream(filepath);

    const uploadParams = {
        Bucket: AWSBUCKETNAME,
        Body: filestream,
        Key: filename
    }

    return s3.upload(uploadParams).promise()
}

exports.uploadFile = uploadFile



function getFileStream(filekey){
    const downloadParam = {
        Key: filekey,
        Bucket: AWSBUCKETNAME,
    }

    return s3.getObject(downloadParam).createReadStream();
}

exports.getFileStream = getFileStream