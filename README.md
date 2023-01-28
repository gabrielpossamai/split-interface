# Split Interface

A script to split one file with many interfaces to a folder with a interface file for each interface and create the index file to export all interfaces.

## Interface structure needed

To the script works, the interface should have the following structure:

```typescript
  export interface ITest {
    field1: string;
    field2: string;
  }
```
The `export` is optional

## How to run (npm)

Install dependencies using `npm install`

Run with `npm run start`

Get the help context with `npm run start -- --help`

## Help file

```
> split-interface@1.0.0 help
> node index.js --help

index.js [command]

Commands:
  index.js --directory=[dir]  run the interface splitter in the given directory

Options:
      --help       Show help                                           [boolean]
      --version    Show version number                                 [boolean]
  -d, --directory  Directory to run the splitter        [string] [default: "./"]
  -e, --extension  File extension to filter             [string] [default: "ts"]
  -q, --quantity   Minimum of interfaces in the file to split
                                                           [number] [default: 2]
      --demo       Simulate without execute           [boolean] [default: false]
```
