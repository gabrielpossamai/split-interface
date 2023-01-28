#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')

let args = yargs(hideBin(process.argv))
  .command('--directory=[dir]', 'run the interface splitter in the given directory', (yargs) => {
    return yargs
      .positional('directory', {
        describe: 'dir to run the splitter',
        default: './'
      })
  })
  .option('directory', {
    alias: 'd',
    type: 'string',
    description: 'Directory to run the splitter',
    default: './'
  })
  .option('extension', {
    alias: 'e',
    type: 'string',
    description: 'File extension to filter',
    default: 'ts'
  })
  .option('quantity', {
    alias: 'q',
    type: 'number',
    description: 'Minimum of interfaces in the file to split',
    default: 2
  })
  .option('demo', {
    alias: '',
    type: 'boolean',
    description: 'Simulate without execute',
    default: false
  })
  .parse()

const directory = args.directory;
const demo = args.demo;
const extension = args.extension;
const quantity = args.quantity;

console.log('%c[INFO] Starting the application', 'color: blue;');
console.log('%c[INFO] Working on directory: %o', 'color: blue;', directory);
console.log('%c[INFO] Filtering extension: %o', 'color: blue;', extension);
console.log('%c[INFO] Splitting file with more than %i interfaces per file', 'color: blue;', quantity);
console.log('%c[INFO] Demo mode: %o\n', 'color: blue;', demo);

const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/, (letter) => letter.toLowerCase()).replace(/[A-Z][a-z]/g, (letter) => `-${letter.toLowerCase()}`).toLowerCase();

let files = fs.readdirSync(directory);
files = files.filter((file) => file.split('.').includes(extension));
console.log('%c[INFO] Files found in the given directory: %o\n', 'color: yellow;', files);

files.forEach((file) => {
  const newDir = path.join(directory, file.replace(/\.[^/.]+$/, ''));
  if (!fs.existsSync(newDir)) {
    let fileContent = fs.readFileSync(path.join(directory, file));
    console.log('%c[INFO] File: %s - Content: %o', 'color: yellow;', file, fileContent.toString());

    fileContent = fileContent.toString().split('\n').filter((row) => !row.includes('import') && !row.includes('*')).join('\n')
    const interfaces = fileContent.toString().replaceAll('export', '').trim().split(/(?=interface)/gi);
    console.log('%c[INFO] interfaces from file %s: %o', 'color: yellow;', file, interfaces);
    if (interfaces.length > quantity) {
      if (!demo) {
        fs.mkdirSync(newDir);
      }
      const arrayInterface = [];
      interfaces.forEach((data) => {
        if (data.length > 10 && data.includes('interface')) {
          let interfaceName = (data ?? '').replace('interface', '').split('{')[0] ?? '';
          let fileName = camelToSnakeCase(interfaceName.replace('I', '').trim());
          fileName = `${fileName}.interface.ts`;
          const content = `export ${data.trim()}`;

          console.log('%c[INFO] Writing the interface to file %s: %o', 'color: yellow;', fileName, content);
          if (!demo) {
            fs.writeFileSync(path.join(newDir, fileName), `${content}\n`);
          }
          arrayInterface.push({file: fileName, interfaceName: interfaceName.trim()})
        }
      });
      const indexImportFile = [];
      arrayInterface.forEach((item) => {
        indexImportFile.push(`import { ${item.interfaceName} } from './${item.file.replace('.ts', '')}';`)
      })
      indexImportFile.push('\n')
      indexImportFile.push('export {')
      indexImportFile.push(arrayInterface.map((item) => `  ${item.interfaceName},`).join('\n'))
      indexImportFile.push('}')
      indexImportFile.push('\n')

      console.log('%c[INFO] Creating the index file for the folder with the interfaces: %o', 'color: white;', arrayInterface);
      console.log('%c[INFO] Index file: %o', 'color: white;', indexImportFile);
      if (!demo) {
        fs.writeFileSync(path.join(newDir, 'index.ts'), indexImportFile.join('\n'));
        if (!fs.existsSync(path.join(directory, 'old'))) {
          fs.mkdirSync(path.join(directory, 'old'));
        }
        fs.renameSync(path.join(directory, file), path.join(directory, 'old', file));
      }
    } else {
      console.log(
        '%c[INFO] interface skipped, the split is define for file with more then 3 interfaces',
        'color: orange;'
      );
    }
  } else {
    console.log(
      '%c[INFO] Directory %s exists. skipped...',
      'color: orange;',
      file.replace(/\.[^/.]+$/, '')
    );
  }
});
