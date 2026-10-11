/**
 * CLI runner for JsonMorph.
 */

const fs = require('fs');
const { diffJson, generateTypeScript, formatJson, minifyJson } = require('../core');
const { chalk } = require('./ansi');

function parseArgs(args) {
  const parsed = {
    command: null,
    positional: [],
    options: {
      port: 3020,
      name: 'RootObject',
      indent: 2,
      minify: false,
      help: false,
      version: false
    }
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      parsed.options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      parsed.options.version = true;
    } else if (arg === '--minify' || arg === '-m') {
      parsed.options.minify = true;
    } else if ((arg === '-n' || arg === '--name') && args[i + 1]) {
      parsed.options.name = args[++i];
    } else if ((arg === '-p' || arg === '--port') && args[i + 1]) {
      parsed.options.port = parseInt(args[++i], 10);
    } else if ((arg === '-i' || arg === '--indent') && args[i + 1]) {
      parsed.options.indent = parseInt(args[++i], 10);
    } else if (!arg.startsWith('-')) {
      parsed.positional.push(arg);
    }
  }

  if (parsed.positional.length > 0) {
    const first = parsed.positional[0].toLowerCase();
    if (['diff', 'to-ts', 'format', 'ui', 'studio', 'help'].includes(first)) {
      parsed.command = first;
      parsed.positional.shift();
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`
${chalk.bold(chalk.cyan('🧬 JsonMorph Studio & CLI'))} ${chalk.dim('v1.0.0')}
${chalk.dim('Zero-dependency JSON diffing, formatting & automatic TypeScript interface generator.')}

${chalk.bold('USAGE:')}
  ${chalk.green('json-morph')} ${chalk.yellow('<command>')} ${chalk.cyan('[options]')}

${chalk.bold('COMMANDS:')}
  ${chalk.yellow('diff <file1> <file2>')}      Compare two JSON files and highlight differences
  ${chalk.yellow('to-ts <file>')}             Generate TypeScript interfaces from JSON file
  ${chalk.yellow('format <file>')}            Format or minify JSON file
  ${chalk.yellow('ui, studio')}               Launch interactive Web Studio on localhost:3020
  ${chalk.yellow('help')}                     Display help guide

${chalk.bold('OPTIONS:')}
  ${chalk.cyan('-n, --name <string>')}      Root TypeScript interface name (default: RootObject)
  ${chalk.cyan('-m, --minify')}             Minify JSON output instead of formatting
  ${chalk.cyan('-i, --indent <num>')}       Indentation spaces (default: 2)
  ${chalk.cyan('-p, --port <number>')}      Port for Web Studio (default: 3020)
  ${chalk.cyan('-h, --help')}               Display help guide
  ${chalk.cyan('-v, --version')}            Display version

${chalk.bold('EXAMPLES:')}
  $ json-morph diff old.json new.json
  $ json-morph to-ts data.json --name UserProfile
  $ json-morph format messy.json
  $ json-morph ui --port 3020
`);
}

async function runCliDiff(file1, file2) {
  if (!file1 || !file2) {
    console.error(chalk.red('✖ Error: Both file paths required. Example: json-morph diff a.json b.json'));
    return 1;
  }
  const raw1 = fs.readFileSync(file1, 'utf8');
  const raw2 = fs.readFileSync(file2, 'utf8');

  const diff = diffJson(raw1, raw2);

  console.log(`\n${chalk.bold(chalk.cyan('🧬 JsonMorph Structural Diff'))}`);
  console.log(`  Comparing: ${chalk.dim(file1)} ⟷ ${chalk.dim(file2)}\n`);

  if (diff.equal) {
    console.log(chalk.green('✔ Both JSON objects are structurally identical.\n'));
    return 0;
  }

  console.log(`Differences Summary: ${chalk.green(`+${diff.stats.addedCount} added`)} | ${chalk.red(`-${diff.stats.removedCount} removed`)} | ${chalk.yellow(`~${diff.stats.modifiedCount} modified`)}\n`);

  if (diff.added.length > 0) {
    console.log(chalk.bold(chalk.green('Added Fields (+) :')));
    diff.added.forEach(item => console.log(`  ${chalk.green('+')} ${chalk.bold(item.path)}: ${JSON.stringify(item.value)}`));
    console.log('');
  }

  if (diff.removed.length > 0) {
    console.log(chalk.bold(chalk.red('Removed Fields (-) :')));
    diff.removed.forEach(item => console.log(`  ${chalk.red('-')} ${chalk.bold(item.path)}: ${JSON.stringify(item.value)}`));
    console.log('');
  }

  if (diff.modified.length > 0) {
    console.log(chalk.bold(chalk.yellow('Modified Fields (~) :')));
    diff.modified.forEach(item => {
      console.log(`  ${chalk.yellow('~')} ${chalk.bold(item.path)}: ${chalk.red(JSON.stringify(item.oldValue))} ➔ ${chalk.green(JSON.stringify(item.newValue))}`);
    });
    console.log('');
  }

  return 0;
}

function runCliToTs(file, name) {
  if (!file) {
    console.error(chalk.red('✖ Error: File path required. Example: json-morph to-ts data.json'));
    return 1;
  }
  const raw = fs.readFileSync(file, 'utf8');
  const ts = generateTypeScript(raw, name);
  console.log(ts);
  return 0;
}

function runCliFormat(file, options) {
  if (!file) {
    console.error(chalk.red('✖ Error: File path required. Example: json-morph format data.json'));
    return 1;
  }
  const raw = fs.readFileSync(file, 'utf8');
  const formatted = options.minify ? minifyJson(raw) : formatJson(raw, options.indent);
  console.log(formatted);
  return 0;
}

function runUiServer(options) {
  const { startServer } = require('../server/server');
  startServer(options.port);
}

async function execute(args = process.argv.slice(2)) {
  const parsed = parseArgs(args);
  const { command, positional, options } = parsed;

  if (options.version) {
    const pkg = require('../../package.json');
    console.log(`json-morph v${pkg.version}`);
    return 0;
  }

  if (options.help || command === 'help') {
    printHelp();
    return 0;
  }

  if (command === 'diff') {
    return await runCliDiff(positional[0], positional[1]);
  }

  if (command === 'to-ts') {
    return runCliToTs(positional[0], options.name);
  }

  if (command === 'format') {
    return runCliFormat(positional[0], options);
  }

  if (command === 'ui' || command === 'studio' || !command) {
    runUiServer(options);
    return 0;
  }

  printHelp();
  return 0;
}

module.exports = {
  execute,
  parseArgs
};
