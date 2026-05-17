import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export interface ProductSpec {
    [key: string]: string | number;
}

export async function getProductSpecs(productId: string): Promise<ProductSpec[] | null> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'specs', `${productId}.xlsx`);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.warn(`Spec file not found for: ${productId}`);
            return null;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        // Assume the first sheet contains the data
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        // header: 1 returns an array of arrays. We might want strict key-value pairs if it's a list of properties.
        // Or if it's a table, we can use default (array of objects).
        // Let's assume it's a simple key-value table or a standard table. 
        // Usually specs are "Feature | Value".
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Filter out empty rows and map to a clean structure
        // We'll represent it as a list of { label: string, value: string } for generic display
        const specs: ProductSpec[] = jsonData
            .filter(row => row.length >= 2) // Ensure at least key and value
            .map(row => ({
                label: String(row[0]).trim(),
                value: String(row[1]).trim(),
            }));

        return specs;
    } catch (error) {
        console.error(`Error reading Excel file for ${productId}:`, error);
        return null;
    }
}
