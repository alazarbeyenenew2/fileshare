import { NextResponse } from "next/server";
import QRCode from "qrcode";

// GET - Generate QR code for folder
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/folder/${id}`;

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: {
                dark: '#667eea',
                light: '#ffffff'
            }
        });

        return NextResponse.json({ qrCode: qrDataUrl, url });
    } catch (error) {
        console.error("QR generation error:", error);
        return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
    }
}
