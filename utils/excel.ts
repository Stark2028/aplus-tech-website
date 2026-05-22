import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export interface ProductSpec {
    [key: string]: string | number;
}

export async function getProductSpecs(productId: string): Promise<ProductSpec[] | null> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'specs', `${productId}.xlsx`);

        if (!fs.existsSync(filePath)) {
            console.warn(`Spec file not found for: ${productId}`);
            return null;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) return null;

        const specs: ProductSpec[] = [];
        worksheet.eachRow((row) => {
            const rowValues = row.values as unknown[];
            const key = rowValues[1];
            const value = rowValues[2];
            
            if (key !== undefined && value !== undefined) {
                specs.push({
                    label: String(key).trim(),
                    value: String(value).trim(),
                });
            }
        });

        return specs;
    } catch (error) {
        console.error(`Error reading Excel file for ${productId}:`, error);
        return null;
    }
}
