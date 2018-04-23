#!/usr/bin/env node
const fs = require('fs');
const util = require('util');
const program = require('commander');
// const translate = require('@google-cloud/translate');
const translate = require('google-translate-api');

program
  .version('0.1.0')
  .option('--phrase <phrase>')
  .option('--input <file>')
  .option('--from <language>')
  .option('--to <language>')
  .option('--output [file]')
  .option('--ignoreToken <token>')
  .parse(process.argv);

args = {
  to: { required: true, value: program.to},
  from: { required: true, value: program.from},
  input: { required: false, value: program.input },
  phrase: { required: false, value: program.phrase},
  output: { required: false, value: program.output},
  ignoreToken: { required: false, value: program.ignoreToken},
}

function isObject(obj) {
  const type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};

function main(args) {
  let ws = null;
  const start = Date.now();
  const promises = [];
  const output = {};
  const ignoredOutput = {}

  if (args.phrase.value) {
    const toLangs = args.to.value.split(',')
    for (let lang of toLangs) {
      promises.push(
        translate(args.phrase.value, { from: args.from.value, to: lang })
        .then((res) => {
          output[lang] = res.text;
        })
        .catch((err) => {
          console.log(`Error for language '${lang}': ${err instanceof Error ? err.message : err}`);
        })
      )
    }
  } else {
    if (!fs.existsSync(args.input.value)) {
      console.log(`The input file '${args.input.value}' could not be found. Verify the relative path to this file.`);
      process.exit(1);
    }
    const input = require(args.input.value);
    if (!isObject(input)) {
      console.log('The input file must export a valid object');
      process.exit(1);
    }
    if (args.output.value) {
      ws = fs.createWriteStream(args.output.value, {
        flags: 'w',
        encoding: 'utf-8'
      });
    }

    function translateChildren(prefix, child) {
      for (let key in child) {
        if (isObject(child[key])) {
          if (prefix.length) {
            translateChildren(`${prefix}.${key}`, child[key]);
          } else {
            translateChildren(key, child[key]);
          }
        } else {
          if (!args.ignoreToken.value || !child[key].includes(args.ignoreToken.value)) {
            promises.push(
              translate(child[key], { from: args.from.value, to: args.to.value })
              .then((res) => {
                if (prefix.length) {
                  output[`${prefix}.${key}`] = res.text;
                } else {
                  output[key] = res.text;
                }
              })
              .catch((err) => {
                console.log(`Error for key '${key}' and value '${child[key]}': ${err instanceof Error ? err.message : err}`);
              })
            );
          } else {
            if (prefix.length) {
              ignoredOutput[`${prefix}.${key}`] = child[key];
            } else {
              ignoredOutput[key] = child[key];
            }
          }
        }
      }
    }

    translateChildren('', input);
  }

  Promise.all(promises)
  .then(() => {
    const end = Date.now();
    console.log(`\nFinished. Translations took ${end - start} ms.`);
    if (ws && args.output.value) {
      ws.write('module.exports = ' + util.inspect(output));
      ws.end();
      console.log(`\nWrote translations to '${args.output.value}'`);
    }

    if (args.phrase.value && !args.input.value) {
      console.log(`\nTranslation for the phrase '${args.phrase.value}':\n`);
      console.log('-----------------------------------------------------');
      logObjectItems(output);
    }

    if (args.input.value && !args.output.value) {
      console.log('\nTranslations:\n');
      console.log('-----------------------------------------------------');
      logObjectItems(output);
    }

    if (args.ignoreToken.value) {
      console.log(`\nItems with ignored token '${args.ignoreToken.value}':\n`);
      console.log('-----------------------------------------------------');
      logObjectItems(ignoredOutput);
    }
  })
}

function processArgs(args) {
  newError = (msg) => Promise.reject(new Error(msg));
  if (args.input.value) {
    if (args.phrase.value) {
      return newError("Specify either an 'input' file option or a single 'phrase' to translate but not both.");
    }
  } else {
    if (!args.phrase.value) {
      return newError("Specify either an 'input' file option or a single 'phrase' to translate.");
    }
  }
  if (args.phrase.value) {
    if (args.input.value) {
      return newError("Specify either an 'input' file option or a single 'phrase' to translate but not both.");
    }
  } else {
    if (!args.input.value) {
      return newError("Specify either an 'input' file option or a single 'phrase' to translate.");
    }
  }
  if (!args.from.value) {
    return newError("Specify a 'from' option.")
  } else if (args.from.value.split(",").length > 1) {
    return newError("Specify only one 'from' language option.")
  }
  if (!args.to.value) {
    if (args.input.value && !args.phrase.value) {
      return newError("Specify a 'to' option when providing an 'input' file option.")
    } else if (!args.input.value && args.phrase.value) {
      return newError("Specify a 'to' option when providing a 'phrase'.")
    } else {
      return newError("Specify a 'to' option.")
    }
  } else {
    const arrayOfLangs = args.to.value.split(',').length > 1;
    if (arrayOfLangs && args.input.value) {
      return newError("Specify a single 'to' language for translating into an 'input' file option.")
    }
  }
  if (args.ignoreToken.value && args.phrase.value) {
    return newError("Specify a 'phrase' without an 'ignoreToken' option.")
  }
  return Promise.resolve(args)
}

function logObjectItems(obj) {
  for (let key in obj) {
    console.log(`\t${key}: ${obj[key]}`);
  }
}

processArgs(args)
.then(main)
.catch(err => {
  console.log(err.message);
  process.exit(1);
})
