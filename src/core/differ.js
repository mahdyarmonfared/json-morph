/**
 * Deep Structural JSON Diff Engine for JsonMorph.
 */

const { validateJson } = require('./formatter');

function diffJson(leftInput, rightInput) {
  const leftVal = validateJson(leftInput);
  const rightVal = validateJson(rightInput);

  if (!leftVal.valid) throw new Error(`Invalid Left JSON: ${leftVal.error}`);
  if (!rightVal.valid) throw new Error(`Invalid Right JSON: ${rightVal.error}`);

  const added = [];
  const removed = [];
  const modified = [];

  function compareRecursive(objA, objB, currentPath = '') {
    if (objA === objB) return;

    const isObjA = typeof objA === 'object' && objA !== null;
    const isObjB = typeof objB === 'object' && objB !== null;

    if (!isObjA || !isObjB) {
      modified.push({
        path: currentPath || 'root',
        oldValue: objA,
        newValue: objB
      });
      return;
    }

    const isArrA = Array.isArray(objA);
    const isArrB = Array.isArray(objB);

    if (isArrA !== isArrB) {
      modified.push({
        path: currentPath || 'root',
        oldValue: objA,
        newValue: objB
      });
      return;
    }

    if (isArrA && isArrB) {
      const maxLen = Math.max(objA.length, objB.length);
      for (let i = 0; i < maxLen; i++) {
        const itemPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
        if (i >= objA.length) {
          added.push({ path: itemPath, value: objB[i] });
        } else if (i >= objB.length) {
          removed.push({ path: itemPath, value: objA[i] });
        } else {
          compareRecursive(objA[i], objB[i], itemPath);
        }
      }
      return;
    }

    // Object comparison
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    const allKeys = Array.from(new Set([...keysA, ...keysB]));

    for (const key of allKeys) {
      const propPath = currentPath ? `${currentPath}.${key}` : key;

      if (!(key in objA)) {
        added.push({ path: propPath, value: objB[key] });
      } else if (!(key in objB)) {
        removed.push({ path: propPath, value: objA[key] });
      } else {
        compareRecursive(objA[key], objB[key], propPath);
      }
    }
  }

  compareRecursive(leftVal.data, rightVal.data);

  const totalDifferences = added.length + removed.length + modified.length;
  const equal = totalDifferences === 0;

  return {
    equal,
    stats: {
      addedCount: added.length,
      removedCount: removed.length,
      modifiedCount: modified.length,
      totalDifferences
    },
    added,
    removed,
    modified
  };
}

module.exports = {
  diffJson
};
