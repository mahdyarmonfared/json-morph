document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabViews = document.querySelectorAll('.tab-view');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Tab 1: Diff Handlers
  const diffLeft = document.getElementById('diffLeft');
  const diffRight = document.getElementById('diffRight');
  const runDiffBtn = document.getElementById('runDiffBtn');
  const diffStats = document.getElementById('diffStats');
  const diffSummaryList = document.getElementById('diffSummaryList');

  // Set default diff sample
  diffLeft.value = JSON.stringify({
    name: "Alice",
    age: 25,
    skills: ["JavaScript", "Node.js"],
    address: { city: "New York", country: "USA" }
  }, null, 2);

  diffRight.value = JSON.stringify({
    name: "Alice Smith",
    age: 26,
    skills: ["JavaScript", "Node.js", "TypeScript"],
    address: { city: "San Francisco", country: "USA" },
    active: true
  }, null, 2);

  runDiffBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          left: diffLeft.value,
          right: diffRight.value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Diff failed');

      renderDiff(data);
    } catch (err) {
      alert('Diff Error: ' + err.message);
    }
  });

  function renderDiff(diff) {
    if (diff.equal) {
      diffStats.innerHTML = '<span style="color: var(--accent-green)">✔ JSON Objects are identical</span>';
      diffSummaryList.innerHTML = '<div class="diff-item diff-added">No differences detected. Both payloads are identical.</div>';
      return;
    }

    const { addedCount, removedCount, modifiedCount } = diff.stats;
    diffStats.innerHTML = `
      <span style="color: var(--accent-green)">+${addedCount} added</span> | 
      <span style="color: var(--accent-red)">-${removedCount} removed</span> | 
      <span style="color: var(--accent-yellow)">~${modifiedCount} modified</span>
    `;

    diffSummaryList.innerHTML = '';

    diff.added.forEach(item => {
      const el = document.createElement('div');
      el.className = 'diff-item diff-added';
      el.textContent = `+ Added: ${item.path} = ${JSON.stringify(item.value)}`;
      diffSummaryList.appendChild(el);
    });

    diff.removed.forEach(item => {
      const el = document.createElement('div');
      el.className = 'diff-item diff-removed';
      el.textContent = `- Removed: ${item.path} (was ${JSON.stringify(item.value)})`;
      diffSummaryList.appendChild(el);
    });

    diff.modified.forEach(item => {
      const el = document.createElement('div');
      el.className = 'diff-item diff-modified';
      el.textContent = `~ Modified: ${item.path} from ${JSON.stringify(item.oldValue)} ➔ ${JSON.stringify(item.newValue)}`;
      diffSummaryList.appendChild(el);
    });
  }

  // Tab 2: TypeScript Generator Handlers
  const tsInput = document.getElementById('tsInput');
  const rootInterfaceName = document.getElementById('rootInterfaceName');
  const genTsBtn = document.getElementById('genTsBtn');
  const copyTsBtn = document.getElementById('copyTsBtn');
  const tsOutput = document.getElementById('tsOutput');

  tsInput.value = JSON.stringify({
    id: 101,
    username: "john_doe",
    email: "john@example.com",
    isVerified: true,
    roles: ["admin", "editor"],
    profile: {
      bio: "Full stack engineer",
      avatarUrl: "https://example.com/avatar.png",
      loginCount: 42
    }
  }, null, 2);

  async function generateTs() {
    try {
      const res = await fetch('/api/to-ts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: tsInput.value,
          rootName: rootInterfaceName.value.trim() || 'RootObject'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      tsOutput.textContent = data.ts;
    } catch (err) {
      tsOutput.textContent = `// Error: ${err.message}`;
    }
  }

  genTsBtn.onclick = generateTs;
  copyTsBtn.onclick = () => {
    navigator.clipboard.writeText(tsOutput.textContent);
    copyTsBtn.textContent = 'Copied!';
    setTimeout(() => copyTsBtn.textContent = '📋 Copy TypeScript', 2000);
  };

  // Tab 3: Formatter Handlers
  const formatInput = document.getElementById('formatInput');
  const formatBtn = document.getElementById('formatBtn');
  const minifyBtn = document.getElementById('minifyBtn');
  const copyFormatBtn = document.getElementById('copyFormatBtn');

  formatInput.value = '{"id":1,"name":"Alice","skills":["Node.js","React"],"active":true,"config":{"retries":3,"timeout":5000}}';

  formatBtn.onclick = async () => {
    try {
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: formatInput.value, indent: 2, minify: false })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      formatInput.value = data.output;
    } catch (err) {
      alert('Format Error: ' + err.message);
    }
  };

  minifyBtn.onclick = async () => {
    try {
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: formatInput.value, minify: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      formatInput.value = data.output;
    } catch (err) {
      alert('Minify Error: ' + err.message);
    }
  };

  copyFormatBtn.onclick = () => {
    navigator.clipboard.writeText(formatInput.value);
    copyFormatBtn.textContent = 'Copied!';
    setTimeout(() => copyFormatBtn.textContent = '📋 Copy Result', 2000);
  };

  // Initial runs
  runDiffBtn.click();
  generateTs();
});
