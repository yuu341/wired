import AWS from 'aws-sdk';

// MinIO（S3互換）の設定
const s3Config = {
    endpoint: import.meta.env.VITE_S3_ENDPOINT || 'http://localhost:9000',
    accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: import.meta.env.VITE_S3_SECRET_KEY || 'minioadmin',
    s3ForcePathStyle: true, // MinIOでは必須
    signatureVersion: 'v4',
    region: 'us-east-1' // 任意のリージョン
};

const s3 = new AWS.S3(s3Config);
const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET || 'dev-bucket';

export class S3Service {
    /**
     * ファイルをアップロード
     */
    static async uploadFile(file, key) {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file,
                ContentType: file.type
            };

            const result = await s3.upload(params).promise();
            console.log('Upload successful:', result.Location);
            return result;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    }

    /**
     * ファイルをダウンロード
     */
    static async downloadFile(key) {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: key
            };

            const result = await s3.getObject(params).promise();
            return result.Body;
        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    }

    /**
     * ファイル一覧を取得
     */
    static async listFiles(prefix = '') {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Prefix: prefix
            };

            const result = await s3.listObjectsV2(params).promise();
            return result.Contents;
        } catch (error) {
            console.error('List failed:', error);
            throw error;
        }
    }

    /**
     * ファイルを削除
     */
    static async deleteFile(key) {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: key
            };

            const result = await s3.deleteObject(params).promise();
            console.log('Delete successful:', key);
            return result;
        } catch (error) {
            console.error('Delete failed:', error);
            throw error;
        }
    }

    /**
     * 署名付きURLを生成（一時的なアクセス用）
     */
    static getSignedUrl(key, expires = 3600) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: expires
        };

        return s3.getSignedUrl('getObject', params);
    }
}