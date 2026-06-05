const fs = require('fs');
const glob = require('glob');

const files = glob.sync('**/*.{tsx,ts,html}', { ignore: ['node_modules/**', 'dist/**', '.git/**'] });
console.log(`Found ${files.length} files`);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Typography
  content = content.replace(/className=\"([^\"]*?)\bserif\b([^\"]*?)\"/g, 'className=\"$1font-extrabold tracking-tight$2\"');
  content = content.replace(/className=\"([^\"]*?)\bitalic\b([^\"]*?)\"/g, 'className=\"$1text-[#48CAE4]$2\"');
  content = content.replace(/className=`([^\`]*?)\bserif\b([^\`]*?)`/g, 'className=`$1font-extrabold tracking-tight$2`');
  content = content.replace(/className=`([^\`]*?)\bitalic\b([^\`]*?)`/g, 'className=`$1text-[#48CAE4]$2`');
  
  // Specific wording replacements
  if (file === 'index.html') {
    content = content.replace(/Luxury Belize Scuba Diving/g, 'Belize Scuba Diving & Adventure');
    content = content.replace(/luxury scuba/ig, 'premier scuba');
    content = content.replace(/Quiet Luxury/g, 'Fun & Action');
  }
  
  if (file === 'services/geminiService.ts') {
    content = content.replace(/Quiet Luxury vibe/g, 'Energetic, Friendly Adventure vibe');
    content = content.replace(/luxury expedition planning/g, 'adventure planning');
  }

  if (file === 'constants.tsx' || file.includes('IslandAdventures') || file.includes('MainlandAdventures') || file.includes('TourDetail') || file.includes('App.tsx')) {
    content = content.replace(/luxury expeditions/ig, 'unforgettable adventures');
    content = content.replace(/quiet luxury/ig, 'exclusive fun');
    content = content.replace(/Luxury Inclusions/ig, 'Adventure Inclusions');
  }
  
  if (file === 'App.tsx') {
    content = content.replace(/Curated Inquiry/g, 'Book Your Adventure');
    content = content.replace(/Guest Manifest/g, 'Guest Details');
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
