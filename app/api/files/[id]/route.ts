import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const METADATA_FILE = path.join(process.cwd(), "file-metadata.json");

interface FileMetadata {
    id: string;
    filename: string;
    filepath: string;
    folderId: string;
    uploadedAt: string;
}

async function readMetadata(): Promise<FileMetadata[]> {
    try {
        if (existsSync(METADATA_FILE)) {
            const data = await readFile(METADATA_FILE, "utf-8");
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Error reading metadata", err);
    }
    return [];
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const metadata = await readMetadata();
    const fileData = metadata.find((f) => f.id === id);

    if (!fileData) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file and send it back
    const fileBuffer = await readFile(fileData.filepath);

    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${fileData.filename}"`,
        },
    });
}
