#!/usr/bin/env node
/**
 * Verify sprint counts in code before writing any deck narrative (SKILL.md §7b).
 * Usage: node tally.js config.sprintNN.json
 * Reads cfg.ticketsFile and cfg.sprint.window {start,end} (ISO with offset) for the resolution-window split.
 */
const fs = require('fs'), path = require('path');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const d = JSON.parse(fs.readFileSync(path.resolve(path.dirname(process.argv[2]), cfg.ticketsFile), 'utf8'));
const S = new Date(cfg.sprint.window.start), E = new Date(cfg.sprint.window.end);
const cnt = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const done = d.filter(x => x.category === 'Done');
console.log('total', d.length);
console.log('status', cnt(d, x => x.status));
console.log('category', cnt(d, x => x.category));
console.log('type done/total', Object.fromEntries([...new Set(d.map(x => x.type))].map(t => [t, `${done.filter(x => x.type === t).length}/${d.filter(x => x.type === t).length}`])));
console.log('done', done.length, (100 * done.length / d.length).toFixed(1) + '%', '| carry', d.length - done.length);
console.log('\nDone by resolution window (BEFORE/IN/AFTER the sprint):');
done.forEach(x => { const r = new Date(x.resolved); console.log(' ', x.key, (x.resolved || '').slice(0, 10), r < S ? 'BEFORE' : r > E ? 'AFTER' : 'IN', x.dev.join('+') || '-', '|', x.summary); });
console.log('\nBuilt by (Developer field):', cnt(done.flatMap(x => x.dev.length ? x.dev : ['(none)']), x => x));
console.log('Closed by (Assignee):', cnt(done, x => x.assignee));
console.log('\nNon-Done tickets carrying a resolution date (Ready for QA transition sets it; do NOT count as Done):');
d.filter(x => x.category !== 'Done' && x.resolved).forEach(x => console.log(' ', x.key, x.status, x.resolved.slice(0, 10)));
console.log('\nCarry-over by status:', cnt(d.filter(x => x.category !== 'Done'), x => x.status));
console.log('Carry-over by assignee:', cnt(d.filter(x => x.category !== 'Done'), x => x.assignee));
console.log('Epic links:', cnt(d, x => x.epic || '(none)'));
