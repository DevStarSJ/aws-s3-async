import * as AWS from "aws-sdk";
import * as Rx from 'rxjs';
import {createReadStream, createWriteStream} from "fs";
import {GetObjectRequest, ListObjectsRequest, PutObjectRequest} from "aws-sdk/clients/s3";

const awsS3 = new AWS.S3();


export function getObjectAsync(params: GetObjectRequest, fileName: string): Promise<string> {

    const fileStream = createWriteStream(fileName);

    return new Promise((resolve, reject) => {
        return awsS3.getObject(params).createReadStream()
            .on('end', () => {
                return resolve(fileName);
            }).on('error', (error: any) => {
                reject(error);
            }).pipe(fileStream);
    });
}


export function putObjectAsync(params: PutObjectRequest, fileName: string): Promise<any> {
    const putParam: PutObjectRequest = Object.assign({}, params);
    putParam.Body = createReadStream(fileName);

    return new Promise((resolve, reject) => {
        return awsS3.putObject(putParam, (error: any, data) =>  {
            if (error) {
                reject(error);
            }
            resolve(data);
        });
    });
}


export function listObjectsAsync(params: ListObjectsRequest): Promise<any> {
    return new Promise((resolve, reject) => {
        return awsS3.listObjects(params, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

export async function listAllKeys(params:ListObjectsRequest , nextFunction: (data: any) => void) {
    let marker: string = undefined;
    let isRemainObjects: boolean = true;

    while (isRemainObjects) {
        const paramNext: ListObjectsRequest = Object.assign({}, params);
        if (marker)
            paramNext.Marker = marker;

        const data: any = await listObjectsAsync(paramNext);
        nextFunction(data.Contents.map(o => o.Key));

        if(!data.IsTruncated)
            isRemainObjects = false;
        marker = data.Contents[data.Contents.length - 1].Key;
    }
}


export async function listAllKeysAsync(params: ListObjectsRequest): Promise<string[]> {
    let allKeys: string[] = [];

    await listAllKeys(params, data => {
        allKeys.push(...data);
    });

    return allKeys;
}


export function listAllKeysRx(params: ListObjectsRequest): Rx.Observable<any> {
    return Rx.Observable.create(async (observer) => {
        await listAllKeys(params, data => {
            observer.next(data);
        });
    });
}


