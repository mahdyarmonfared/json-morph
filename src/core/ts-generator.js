/**
 * Automatic JSON to TypeScript Interface Generator for JsonMorph.
 */

const { validateJson } = require('./formatter');

function capitalize(str) {
  if (!str) return 'Item';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateTypeScript(input, rootInterfaceName = 'RootObject') {
  const val = validateJson(input);
  if (!val.valid) throw new Error(`Invalid JSON: ${val.error}`);

  const interfaces = [];
  const generatedNames = new Set();

  function inferType(value, keyHint = '') {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';

    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]';
      const itemTypes = Array.from(new Set(value.map((item, idx) => inferType(item, keyHint ? `${keyHint}Item` : 'Item'))));
      if (itemTypes.length === 1) {
        return `${itemTypes[0]}[]`;
      }
      return `(${itemTypes.join(' | ')})[]`;
    }

    if (typeof value === 'object') {
      let ifaceName = capitalize(keyHint || 'ChildObject');
      if (generatedNames.has(ifaceName)) {
        let counter = 2;
        while (generatedNames.has(`${ifaceName}${counter}`)) {
          counter++;
        }
        ifaceName = `${ifaceName}${counter}`;
      }

      generatedNames.add(ifaceName);
      buildInterface(value, ifaceName);
      return ifaceName;
    }

    return 'any';
  }

  function buildInterface(obj, name) {
    const lines = [];
    lines.push(`export interface ${name} {`);

    const keys = Object.keys(obj);
    if (keys.length === 0) {
      lines.push('  [key: string]: any;');
    } else {
      for (const key of keys) {
        const val = obj[key];
        const typeStr = inferType(val, key);
        const isSafeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
        const formattedKey = isSafeKey ? key : JSON.stringify(key);
        lines.push(`  ${formattedKey}: ${typeStr};`);
      }
    }

    lines.push('}');
    interfaces.unshift(lines.join('\n'));
  }

  if (Array.isArray(val.data)) {
    if (val.data.length > 0 && typeof val.data[0] === 'object' && val.data[0] !== null) {
      buildInterface(val.data[0], rootInterfaceName);
      interfaces.push(`export type ${rootInterfaceName}List = ${rootInterfaceName}[];`);
    } else {
      const itemType = inferType(val.data[0] || null, 'Item');
      interfaces.push(`export type ${rootInterfaceName} = ${itemType}[];`);
    }
  } else if (typeof val.data === 'object' && val.data !== null) {
    buildInterface(val.data, rootInterfaceName);
  } else {
    interfaces.push(`export type ${rootInterfaceName} = ${typeof val.data};`);
  }

  return interfaces.join('\n\n');
}

module.exports = {
  generateTypeScript
};
