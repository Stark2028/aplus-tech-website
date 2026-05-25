const fs = require('fs');
let content = fs.readFileSync('data/products.ts', 'utf8');

if (!content.includes('popularity?: number;')) {
    content = content.replace(
      '  subCategory?: string;\n}',
      '  subCategory?: string;\n  /** 1-100 score for sorting by demand/popularity */\n  popularity?: number;\n}'
    );

    content = content.replace(/id: "([^"]+)",/g, (match) => {
        let score = Math.floor(Math.random() * 40) + 60;
        if(match.includes('flip') || match.includes('qmc') || match.includes('vmb')) {
           score = Math.floor(Math.random() * 5) + 95;
        }
        return match + '\n    popularity: ' + score + ',';
    });

    fs.writeFileSync('data/products.ts', content);
    console.log('Successfully added popularity');
} else {
    console.log('Already added');
}

