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
const Rx = require("rxjs");
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
function listAllKeys(params, nextFunction) {
    return __awaiter(this, void 0, void 0, function* () {
        let marker = undefined;
        let isRemainObjects = true;
        while (isRemainObjects) {
            const paramNext = Object.assign({}, params);
            if (marker)
                paramNext.Marker = marker;
            const data = yield listObjectsAsync(paramNext);
            nextFunction(data);
            if (!data.IsTruncated)
                isRemainObjects = false;
            marker = data.Contents[data.Contents.length - 1].Key;
        }
    });
}
function listAllKeysAsync(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let allKeys = [];
        yield listAllKeys(params, data => {
            allKeys.push(...data.Contents.map(o => o.Key));
        });
        return allKeys;
    });
}
exports.listAllKeysAsync = listAllKeysAsync;
function listAllKeysRx(params) {
    return Rx.Observable.create((observer) => __awaiter(this, void 0, void 0, function* () {
        yield listAllKeys(params, data => {
            observer.next(data.Contents.map(a => a.Key));
        });
    }));
}
exports.listAllKeysRx = listAllKeysRx;
