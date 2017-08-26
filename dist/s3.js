"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const fs_1 = require("fs");
const awsS3 = new AWS.S3();
function getObjectAsync(params, fileName) {
    const fileStream = fs_1.createWriteStream(fileName);
    return new Promise((resolve, reject) => {
        return awsS3.getObject(params).createReadStream()
            .on('end', () => {
            return resolve(fileName);
        }).on('error', (error) => {
            reject(error);
        }).pipe(fileStream);
    });
}
exports.getObjectAsync = getObjectAsync;
function putObjectAsync(params, fileName) {
    const putParam = Object.assign({}, params);
    putParam.Body = fs_1.createReadStream(fileName);
    return new Promise((resolve, reject) => {
        return awsS3.putObject(params, (error, data) => {
            if (error) {
                reject(error);
            }
            resolve(data);
        });
    });
}
exports.putObjectAsync = putObjectAsync;
function listObjectsAsync(params) {
    return new Promise((resolve, reject) => {
        return awsS3.listObjects(params, (err, data) => {
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
exports.listObjectsAsync = listObjectsAsync;
function listAllKeysAsync(Bucket, Prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        let allKeys = [];
        const paramsBucket = { Bucket: Bucket, Prefix: Prefix };
        let marker = undefined;
        let isRemainObjects = true;
        while (isRemainObjects) {
            const params = Object.assign({}, paramsBucket);
            if (marker)
                params.Marker = marker;
            const data = yield listObjectsAsync(params);
            allKeys.push(...data.Contents.map(o => o.Key));
            if (!data.IsTruncated)
                isRemainObjects = false;
            marker = data.NextMarker;
        }
        return allKeys;
    });
}
exports.listAllKeysAsync = listAllKeysAsync;
