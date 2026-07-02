const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk(path.join(__dirname, 'src'), (err, results) => {
  if (err) throw err;
  results.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    content = content.replace(/SKML Mobiles/gi, 'HBGO');
    content = content.replace(/SKML MOBILES/g, 'HBGO');
    content = content.replace(/skmlmobiles\.com/gi, 'hbgo.com');
    content = content.replace(/The Face Behind SKML/gi, 'The Face Behind HBGO');
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  });
});
