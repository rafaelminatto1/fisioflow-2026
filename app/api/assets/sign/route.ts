
import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '../../../../services/storage';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { filename, mimeType, sizeBytes } = body;
        
        // Mock RBAC: Get clinicId from session/token
        // const session = await getSession();
        const clinicId = 'demo-clinic-1';

        if (!filename || !mimeType || !sizeBytes) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const signedData = await storageService.getSignedUploadUrl(
            filename, 
            mimeType, 
            sizeBytes, 
            clinicId
        );

        return NextResponse.json(signedData);

    } catch (error: any) {
        console.error('Sign Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
