import * as AWS from "aws-sdk";
import * as RX from 'rxjs';
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
        return awsS3.putObject(params, (error: any, data) =>  {
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


export async function listAllKeysAsync(Bucket: string, Prefix: string): Promise<string[]> {
    let allKeys: string[] = [];

    const paramsBucket: ListObjectsRequest  = {Bucket: Bucket, Prefix: Prefix};

    let marker: string = undefined;
    let isRemainObjects: boolean = true;

    while (isRemainObjects) {
        const params: ListObjectsRequest = Object.assign({}, paramsBucket);
        if (marker)
            params.Marker = marker;

        const data: any = await listObjectsAsync(params);
        allKeys.push(...data.Contents.map(o => o.Key));

        if(!data.IsTruncated)
            isRemainObjects = false;
        marker = data.NextMarker;
    }

    return allKeys;
}
