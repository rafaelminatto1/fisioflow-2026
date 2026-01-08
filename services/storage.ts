
import { v4 as uuidv4 } from 'uuid';

// In a real app, import from @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner
// const s3Client = new S3Client({ region: process.env.AWS_REGION, ... });

interface SignUploadResponse {
    uploadUrl: string; // The URL to PUT the file to
    fileUrl: string; // The final URL where the file will be accessible
    key: string;
}

export const VALID_MIME_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/webp'],
    video: ['video/mp4', 'video/quicktime'],
    pdf: ['application/pdf']
};

export const MAX_SIZES = {
    image: 15 * 1024 * 1024, // 15MB
    video: 150 * 1024 * 1024, // 150MB
    pdf: 30 * 1024 * 1024 // 30MB
};

export const storageService = {
    /**
     * Gera uma URL assinada (Simulada para MVP)
     */
    getSignedUploadUrl: async (
        filename: string, 
        mimeType: string, 
        sizeBytes: number,
        clinicId: string
    ): Promise<SignUploadResponse> => {
        
        // 1. Validate Mime and Size Server-Side before signing
        let type: 'image' | 'video' | 'pdf' | null = null;
        if (VALID_MIME_TYPES.image.includes(mimeType)) type = 'image';
        else if (VALID_MIME_TYPES.video.includes(mimeType)) type = 'video';
        else if (VALID_MIME_TYPES.pdf.includes(mimeType)) type = 'pdf';

        if (!type) throw new Error(`Unsupported File Type: ${mimeType}`);
        if (sizeBytes > MAX_SIZES[type]) throw new Error(`File too large for type ${type}`);

        // 2. Generate Key
        const ext = filename.split('.').pop();
        const key = `${clinicId}/${uuidv4()}.${ext}`;

        // 3. Mock Presigned URL
        // In Prod: 
        // const command = new PutObjectCommand({ Bucket: '...', Key: key, ContentType: mimeType });
        // const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        
        // For this demo, we assume the upload goes to a local API route that acts as S3
        const uploadUrl = `/api/mock-s3-upload?key=${key}&type=${mimeType}`;
        const fileUrl = `https://storage.fisioflow.com/${key}`; // Mock CDN URL

        return { uploadUrl, fileUrl, key };
    },

    deleteFile: async (key: string) => {
        // Mock S3 delete
        console.log(`[Storage] Deleting file: ${key}`);
        return true;
    }
};
