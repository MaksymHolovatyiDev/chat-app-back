import {GridFsStorage} from 'multer-gridfs-storage';
import {ObjectId, MongoClient, GridFSBucket} from 'mongodb';

const {DB_HOST} = process.env;

const url: any = DB_HOST;

export class ImageUtils {
  static storage() {
    return new GridFsStorage({
      url,
      file: (_, file) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
          return {
            bucketName: 'photos',
            filename: `${Date.now()}_${file.originalname}`,
          };
        } else {
          return `${Date.now()}_${file.originalname}`;
        }
      },
    });
  }

  static async getImage(id: string) {
    const mongoClient = new MongoClient(url);
    await mongoClient.connect();

    const database = mongoClient.db();

    const imageBucket = new GridFSBucket(database, {
      bucketName: 'photos',
    });

    return imageBucket.openDownloadStream(new ObjectId(id));
  }
}
