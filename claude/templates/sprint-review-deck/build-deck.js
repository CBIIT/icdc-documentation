#!/usr/bin/env node
/**
 * ICDC Sprint Review & Retrospective deck generator (pptxgenjs).
 * Format baseline: CTDC Sprint 32 / ICDC Sprint 50 decks (Sept 2026). Keep ICDC and CTDC in lockstep.
 *
 * Usage:   node build-deck.js config.sprintNN.json
 * Inputs:  config JSON (all sprint-specific text) + tickets JSON (raw Jira pull, see README.md)
 * Output:  <project>_Sprint<N>_Review_Retro_<meetingDateISO>.pptx in the current directory
 *
 * Every number on the deck is computed from tickets.json; the config carries only narrative.
 * Slide order is fixed (SKILL.md §9c). Demo / release slides are intentionally absent: add them only
 * when something is confirmed deployed to QA/Stage and a release actually shipped.
 */
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('usage: node build-deck.js config.json'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const d = JSON.parse(fs.readFileSync(path.resolve(path.dirname(cfgPath), cfg.ticketsFile), 'utf8'));

// ---------- palette & type (SKILL.md §9b) ----------
const C = { blue: '20558A', dark: '143458', darkCard: '1E4470', light: 'EAF1F8', red: 'BE0000', green: '16A34A', amber: 'D97706', ink: '1F2937', muted: '64748B', line: 'E2E8F0', white: 'FFFFFF', pale: 'A9C3DF', ice: 'CADCFC' };
const H = 'Georgia', B = 'Calibri';
const SEV = { HIGH: C.red, MEDIUM: C.amber, LOW: C.blue };

// ---------- metrics, computed (never hand-counted) ----------
const total = d.length;
const done = d.filter(x => x.category === 'Done');
const st = s => d.filter(x => x.status === s).length;
const M = { total, done: done.length, pct: (100 * done.length / total).toFixed(1), inProg: st('In Progress'), rfr: st('Ready for Review'), rfqa: st('Ready for QA Testing'), hold: st('On Hold'), open: st('Open') + st('Reopened') };
M.motion = M.inProg + M.rfr + M.rfqa + st('Testing'); M.carry = total - M.done;
if (M.motion + M.hold + M.open + M.done !== total) throw new Error(`status buckets do not sum to ${total}; add any new Jira status to the buckets above`);
const types = [...new Set(d.map(x => x.type))];
const T = Object.fromEntries(types.map(t => [t, { done: done.filter(x => x.type === t).length, total: d.filter(x => x.type === t).length }]));
const cnt = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const devC = Object.entries(cnt(done.flatMap(x => x.dev), u => cfg.developerNames[u] || u)).sort((a, b) => b[1] - a[1]);
const asgC = Object.entries(cnt(done, x => (cfg.qaNames || []).includes(x.assignee) ? `${x.assignee} (QA)` : x.assignee)).sort((a, b) => b[1] - a[1]);
const carryByStatus = Object.entries(cnt(d.filter(x => x.category !== 'Done'), x => x.status.replace(' Testing', ''))).sort((a, b) => b[1] - a[1]);
const S = cfg.sprint, N1 = cfg.nextSprint;
const goalsDelivered = cfg.goals.filter(g => g.delivered).length;

// ---------- primitives ----------
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; pres.author = cfg.preparedBy.name; pres.title = `${cfg.project} Sprint ${S.number} Review & Retrospective`;
const FOOT = `${cfg.project} · Sprint ${S.number} Review & Retrospective · ${cfg.meeting.dateLong}`;
const tb = (s, t, o) => s.addText(t, Object.assign({ isTextBox: true, margin: 0, fontFace: B }, o));
const eyebrow = (s, t, x, y, color = C.red, w = 8) => tb(s, t.toUpperCase(), { x, y, w, h: 0.25, fontSize: 9.5, bold: true, color, charSpacing: 2.5 });
const header = (s, eye, t, sub) => { eyebrow(s, eye, 0.6, 0.45); tb(s, t, { x: 0.6, y: 0.72, w: 12.1, h: 0.7, fontFace: H, fontSize: 32, bold: true, color: C.ink }); if (sub) tb(s, sub, { x: 0.6, y: 1.42, w: 12.1, h: 0.32, fontSize: 12, italic: true, color: C.muted }); };
const footer = (s, n) => { s.addShape(pres.ShapeType.line, { x: 0.6, y: 6.95, w: 12.13, h: 0, line: { color: C.line, width: 0.75 } }); tb(s, FOOT, { x: 0.6, y: 7.02, w: 9, h: 0.25, fontSize: 8, color: C.muted }); tb(s, String(n), { x: 12.2, y: 7.02, w: 0.53, h: 0.25, fontSize: 8, color: C.muted, align: 'right' }); };
const box = (s, x, y, w, h, fill = C.white, line = C.line) => s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: fill }, line: { color: line, width: 0.75 } });
const stripe = (s, x, y, h, color, w = 0.06) => s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color }, line: { color } });
const pill = (s, t, x, y, w, color, fs = 9) => { s.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.28, fill: { color }, line: { color }, rectRadius: 0.05 }); tb(s, t, { x, y, w, h: 0.28, fontSize: fs, bold: true, color: C.white, align: 'center', valign: 'middle' }); };
const darkBg = s => { s.background = { color: C.dark }; stripe(s, 0, 0, 7.5, C.red, 0.12); };
const hbar = (s, data, opt) => s.addChart(pres.ChartType.bar, [{ name: opt.name, labels: data.map(x => x[0]), values: data.map(x => x[1]) }], Object.assign({
  barDir: 'bar', chartColors: [opt.color], showLegend: false, showValue: true, dataLabelPosition: 'outEnd', dataLabelFontFace: B, dataLabelFontSize: 10, dataLabelColor: C.ink,
  catAxisLabelFontFace: B, catAxisLabelFontSize: 10, catAxisLabelColor: C.ink, catAxisOrientation: 'maxMin', valAxisLabelFontFace: B, valAxisLabelFontSize: 9, valAxisLabelColor: C.muted,
  valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: 'none' }, valAxisMajorUnit: opt.unit || 1, valAxisMaxVal: opt.max, barGapWidthPct: 60,
}, opt.extra || {}));
const niceMax = v => Math.ceil(v * 1.15 / (v > 10 ? 2 : 1)) * (v > 10 ? 2 : 1) + 1;

// ================= 1. COVER =================
{
  const s = pres.addSlide(); darkBg(s);
  eyebrow(s, `Cancer Research Data Commons · ${cfg.project}`, 0.95, 1.2, C.pale);
  tb(s, `Sprint ${S.number}`, { x: 0.95, y: 1.5, w: 10, h: 1.2, fontFace: H, fontSize: 60, bold: true, color: C.white });
  tb(s, 'Sprint Review & Retrospective', { x: 0.95, y: 2.65, w: 10, h: 0.6, fontFace: H, fontSize: 26, color: C.ice });
  s.addShape(pres.ShapeType.line, { x: 0.95, y: 3.45, w: 2.4, h: 0, line: { color: C.red, width: 1.5 } });
  const rows = [['Sprint dates', S.dateRange], ['Meeting', `${cfg.meeting.dayLong} · ${cfg.meeting.time}`], ['Reviewing', `Sprint ${S.number} (closed) · Sprint ${N1.number} is now active`]];
  rows.forEach((r, i) => s.addText([{ text: r[0] + '   ', options: { color: C.pale } }, { text: r[1], options: { bold: true, color: C.white } }], { x: 0.95, y: 3.75 + i * 0.38, w: 10, h: 0.35, fontFace: B, fontSize: 13, isTextBox: true, margin: 0 }));
  s.addShape(pres.ShapeType.roundRect, { x: 8.55, y: 5.15, w: 4.2, h: 1.65, fill: { color: C.darkCard }, line: { color: C.darkCard }, rectRadius: 0.06 });
  eyebrow(s, 'Prepared by', 8.8, 5.32, C.pale, 3.8);
  tb(s, cfg.preparedBy.name, { x: 8.8, y: 5.55, w: 3.8, h: 0.35, fontFace: H, fontSize: 15, bold: true, color: C.white });
  tb(s, cfg.preparedBy.title, { x: 8.8, y: 5.9, w: 3.8, h: 0.25, fontSize: 9.5, color: C.white });
  tb(s, cfg.preparedBy.org, { x: 8.8, y: 6.17, w: 3.8, h: 0.25, fontSize: 8.5, color: C.pale });
  tb(s, cfg.preparedBy.supporting, { x: 8.8, y: 6.42, w: 3.8, h: 0.25, fontSize: 8.5, color: C.pale });
}

// ================= 2. AGENDA =================
{
  const s = pres.addSlide(); header(s, 'Agenda', "Today's Agenda", cfg.agenda.subtitle); footer(s, 2);
  cfg.agenda.rows.forEach((r, i) => {
    const y = 1.95 + i * 0.79;
    box(s, 0.6, y, 12.13, 0.7, i % 2 ? C.white : C.light);
    tb(s, String(i + 1), { x: 0.85, y: y + 0.12, w: 0.5, h: 0.45, fontFace: H, fontSize: 20, bold: true, color: C.blue, valign: 'middle' });
    tb(s, r.title, { x: 1.35, y: y + 0.09, w: 9.5, h: 0.32, fontFace: H, fontSize: 15, bold: true, color: C.ink });
    tb(s, r.detail, { x: 1.35, y: y + 0.4, w: 9.5, h: 0.25, fontSize: 10.5, color: C.muted });
    tb(s, r.minutes, { x: 11.3, y: y + 0.12, w: 1.2, h: 0.45, fontSize: 11, bold: true, color: C.blue, align: 'right', valign: 'middle' });
  });
  tb(s, `Total: ${cfg.agenda.total}`, { x: 0.6, y: 6.68, w: 12.13, h: 0.25, fontSize: 10, bold: true, color: C.ink, align: 'right' });
}

// ================= 3. BY THE NUMBERS =================
{
  const s = pres.addSlide(); header(s, `Sprint ${S.number} · ${S.dateRangeShort}`, `Sprint ${S.number} by the Numbers`, 'Velocity measured by ticket count: this team does not track story points'); footer(s, 3);
  box(s, 0.6, 1.95, 3.5, 2.05, C.light, C.light);
  s.addText([{ text: String(M.done), options: { fontFace: H, fontSize: 60, bold: true, color: C.blue } }, { text: '  of ' + total, options: { fontFace: H, fontSize: 22, color: C.muted } }], { x: 0.8, y: 2.05, w: 3.2, h: 1.15, isTextBox: true, margin: 0, valign: 'middle' });
  eyebrow(s, 'Tickets closed', 0.8, 3.3, C.ink, 3);
  tb(s, `${M.pct}% completion rate`, { x: 0.8, y: 3.55, w: 3.2, h: 0.25, fontSize: 10, color: C.muted });
  const stats = [[String(M.carry), 'Carry-over tickets', cfg.numbers.carryNote, C.amber], ...cfg.numbers.extraStats.map(x => [x.value, x.label, x.note, SEV[x.tone] || C[x.tone] || C.green])];
  stats.slice(0, 3).forEach((k, i) => {
    const y = 1.95 + i * 0.72;
    box(s, 4.3, y, 3.6, 0.62); stripe(s, 4.3, y, 0.62, k[3]);
    s.addText([{ text: k[0] + '   ', options: { fontFace: H, fontSize: 15, bold: true, color: k[3] } }, { text: k[1], options: { fontFace: B, fontSize: 10, bold: true, color: C.ink } }], { x: 4.5, y: y + 0.05, w: 3.3, h: 0.3, isTextBox: true, margin: 0, valign: 'middle' });
    tb(s, k[2], { x: 4.5, y: y + 0.36, w: 3.3, h: 0.22, fontSize: 8, color: C.muted });
  });
  box(s, 0.6, 4.25, 7.3, 2.45, C.light, C.light);
  tb(s, `How the ${total} tickets break down`, { x: 0.8, y: 4.38, w: 6.9, h: 0.3, fontFace: H, fontSize: 14, bold: true, color: C.blue });
  const brk = [
    [`Closed: ${M.done}`, cfg.numbers.closedNote || '(accepted and done at sprint close)'],
    [`In motion: ${M.motion}`, `(Ready for Review ${M.rfr} · In Progress ${M.inProg} · Ready for QA ${M.rfqa}${cfg.numbers.motionNote ? '; ' + cfg.numbers.motionNote : ''})`],
    [`On hold: ${M.hold}`, cfg.numbers.holdNote || ''],
    [`Open: ${M.open}`, cfg.numbers.openNote || '(never started)'],
  ];
  brk.forEach((r, i) => s.addText([{ text: r[0] + '   ', options: { bold: true, color: C.ink } }, { text: r[1], options: { color: C.muted } }], { x: 0.8, y: 4.75 + i * 0.3, w: 6.9, h: 0.28, fontFace: B, fontSize: 10.5, isTextBox: true, margin: 0 }));
  tb(s, `Carry-over = total − closed = ${total} − ${M.done} = ${M.carry}`, { x: 0.8, y: 6.3, w: 6.9, h: 0.28, fontSize: 10, bold: true, color: C.amber });
  s.addChart(pres.ChartType.doughnut, [{ name: `Sprint ${S.number} status`, labels: ['Closed', 'In motion', 'On hold', 'Open'], values: [M.done, M.motion, M.hold, M.open] }], {
    x: 8.3, y: 1.9, w: 4.4, h: 4.8, holeSize: 55, chartColors: [C.green, C.blue, C.amber, C.muted], showLegend: true, legendPos: 'b', legendFontFace: B, legendFontSize: 9, legendColor: C.ink,
    showValue: true, showPercent: false, dataLabelColor: C.white, dataLabelFontFace: B, dataLabelFontSize: 11, dataLabelFontBold: true,
  });
  s.addNotes(`Computed from ${cfg.ticketsFile}: Closed ${M.done}, Ready for Review ${M.rfr}, In Progress ${M.inProg}, Ready for QA ${M.rfqa}, On Hold ${M.hold}, Open ${M.open} = ${total}. ${cfg.numbers.speakerNote || ''}`);
}

// ================= 4. GOAL SCORECARD =================
{
  const s = pres.addSlide(); header(s, 'Goal Scorecard', `Sprint ${S.number} Goal Scorecard`, cfg.scorecard.subtitle); footer(s, 4);
  box(s, 0.6, 1.95, 12.13, 0.95, C.light, C.light);
  eyebrow(s, cfg.scorecard.bannerEyebrow, 0.85, 2.08, C.muted, 8);
  tb(s, cfg.scorecard.bannerText, { x: 0.85, y: 2.36, w: 8.6, h: 0.4, fontFace: H, fontSize: 14, bold: true, italic: true, color: C.ink, valign: 'middle' });
  const allDone = goalsDelivered === cfg.goals.length, pc = allDone ? C.green : goalsDelivered ? C.green : C.amber;
  s.addShape(pres.ShapeType.roundRect, { x: 9.6, y: 2.13, w: 2.9, h: 0.6, fill: { color: pc }, line: { color: pc }, rectRadius: 0.06 });
  tb(s, `${goalsDelivered ? '✓' : '▲'}  ${goalsDelivered} OF ${cfg.goals.length} DELIVERED`, { x: 9.6, y: 2.13, w: 2.9, h: 0.6, fontFace: H, fontSize: 15, bold: true, color: C.white, align: 'center', valign: 'middle' });
  const rowH = cfg.goals.length <= 4 ? 0.76 : 0.6, gap = cfg.goals.length <= 4 ? 0.86 : 0.68;
  cfg.goals.forEach((g, i) => {
    const y = 3.1 + i * gap, col = g.delivered ? C.green : C.amber;
    box(s, 0.6, y, 12.13, rowH); stripe(s, 0.6, y, rowH, col);
    tb(s, g.delivered ? '✓' : '▲', { x: 0.85, y: y + 0.08, w: 0.5, h: 0.4, fontSize: 20, bold: true, color: col, align: 'center', valign: 'middle' });
    tb(s, g.delivered ? 'DELIVERED' : 'PARTIAL', { x: 0.7, y: y + rowH - 0.28, w: 0.8, h: 0.2, fontSize: 6.5, bold: true, color: col, align: 'center' });
    tb(s, g.title, { x: 1.55, y: y + 0.07, w: 7.6, h: 0.3, fontFace: H, fontSize: 13, bold: true, color: C.ink });
    tb(s, g.detail, { x: 1.55, y: y + 0.36, w: 7.6, h: rowH - 0.36, fontSize: 8.5, color: C.muted, valign: 'top' });
    tb(s, g.refs, { x: 9.3, y: y + 0.07, w: 3.25, h: rowH - 0.14, fontSize: 8.5, bold: true, color: C.blue, align: 'right', valign: 'middle' });
  });
  s.addShape(pres.ShapeType.line, { x: 0.6, y: 6.58, w: 12.13, h: 0, line: { color: C.red, width: 1 } });
  tb(s, cfg.scorecard.bottomLine, { x: 0.6, y: 6.62, w: 12.13, h: 0.32, fontSize: 9, bold: true, color: C.ink });
}

// ================= 5. WORK TYPE =================
{
  const s = pres.addSlide(); header(s, 'Throughput', 'Breakdown by Work Type', `Closed vs. carried, by issue type: ${total} tickets total`); footer(s, 5);
  const labels = types.sort((a, b) => T[b].total - T[a].total);
  const maxT = Math.max(...labels.map(l => T[l].total));
  s.addChart(pres.ChartType.bar, [{ name: 'Closed', labels, values: labels.map(l => T[l].done) }, { name: 'Carried over', labels, values: labels.map(l => T[l].total - T[l].done) }], {
    x: 0.6, y: 1.95, w: 7.2, h: 4.8, barDir: 'bar', barGrouping: 'stacked', chartColors: [C.green, C.amber], showValue: true, dataLabelPosition: 'ctr', dataLabelColor: C.white, dataLabelFontFace: B, dataLabelFontSize: 10, dataLabelFormatCode: '#;-#;',
    showLegend: true, legendPos: 'b', legendFontFace: B, legendFontSize: 9, catAxisLabelFontFace: B, catAxisLabelFontSize: 10, catAxisLabelColor: C.ink, catAxisOrientation: 'maxMin', valAxisLabelFontFace: B, valAxisLabelFontSize: 9, valAxisLabelColor: C.muted, valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: 'none' }, valAxisMaxVal: Math.ceil(maxT / 5) * 5 + 5, valAxisMajorUnit: 5, barGapWidthPct: 60,
  });
  box(s, 8.15, 1.95, 4.58, 4.75, C.light, C.light);
  tb(s, 'What the shape tells us', { x: 8.4, y: 2.1, w: 4.1, h: 0.35, fontFace: H, fontSize: 15, bold: true, color: C.blue });
  cfg.workType.points.slice(0, 4).forEach((p, i) => {
    const step = cfg.workType.points.length > 3 ? 1.0 : 1.3, y = 2.6 + i * step;
    stripe(s, 8.4, y, step - 0.2, SEV[p.tone] || C[p.tone] || C.blue);
    tb(s, p.title, { x: 8.6, y, w: 3.95, h: 0.3, fontSize: 10.5, bold: true, color: C.ink });
    tb(s, p.detail, { x: 8.6, y: y + 0.3, w: 3.95, h: step - 0.5, fontSize: 9, color: C.muted, valign: 'top' });
  });
}

// ================= 6. WHO CLOSED WHAT =================
{
  const s = pres.addSlide(); header(s, 'Team', 'Who Closed What', 'Two different questions: who moved the ticket to Closed, and who wrote the code'); footer(s, 6);
  tb(s, 'Closed by (Assignee at close)', { x: 0.6, y: 1.95, w: 6, h: 0.3, fontFace: H, fontSize: 13, bold: true, color: C.blue });
  tb(s, 'Built by (Developer field)', { x: 7.0, y: 1.95, w: 6, h: 0.3, fontFace: H, fontSize: 13, bold: true, color: C.blue });
  hbar(s, asgC, { name: 'Tickets closed', color: C.blue, max: niceMax(asgC[0][1]), extra: { x: 0.6, y: 2.25, w: 6.0, h: 2.35 } });
  hbar(s, devC, { name: 'Tickets built', color: C.green, max: niceMax(devC[0][1]), extra: { x: 7.0, y: 2.25, w: 5.73, h: 2.35 } });
  box(s, 0.6, 4.85, 6.0, 1.9, C.light, C.light);
  tb(s, '🏆  Shout-out', { x: 0.85, y: 4.98, w: 5.5, h: 0.32, fontFace: H, fontSize: 14, bold: true, color: C.blue });
  tb(s, cfg.team.shoutout, { x: 0.85, y: 5.32, w: 5.5, h: 1.35, fontSize: 9.5, color: C.ink, valign: 'top' });
  box(s, 7.0, 4.85, 5.73, 1.9); stripe(s, 7.0, 4.85, 1.9, C.red, 0.08);
  tb(s, 'Why the two charts disagree', { x: 7.3, y: 4.98, w: 5.2, h: 0.32, fontFace: H, fontSize: 14, bold: true, color: C.ink });
  tb(s, cfg.team.whyDisagree, { x: 7.3, y: 5.32, w: 5.2, h: 1.35, fontSize: 9.5, color: C.muted, valign: 'top' });
}

// ================= 7. CARRY-OVER =================
{
  const s = pres.addSlide(); header(s, 'Looking ahead', `Carry-Over into Sprint ${N1.number}`, `Sprint ${N1.number} is already running: ${N1.dateRange}`); footer(s, 7);
  tb(s, 'Unfinished at close, by status', { x: 0.6, y: 1.95, w: 7, h: 0.3, fontSize: 10, color: C.muted, align: 'center' });
  hbar(s, carryByStatus, { name: 'Carry-over tickets', color: C.amber, max: niceMax(carryByStatus[0][1]), unit: 2, extra: { x: 0.6, y: 2.2, w: 7.0, h: 4.5 } });
  box(s, 8.0, 1.95, 4.73, 1.25, C.light, C.light);
  tb(s, String(N1.inherited), { x: 8.2, y: 1.98, w: 1.5, h: 1.2, fontFace: H, fontSize: 52, bold: true, color: C.amber, valign: 'middle' });
  tb(s, `of ${M.carry} unfinished Sprint ${S.number} tickets are in Sprint ${N1.number}. ${cfg.carry.bigNote}`, { x: 9.7, y: 2.1, w: 2.9, h: 1.0, fontSize: 9.5, color: C.ink, valign: 'middle' });
  const facts = [{ title: `Sprint ${N1.number} is ${Math.round(100 * N1.inherited / N1.total)}% inherited`, detail: `${N1.inherited} open carry-overs of ${N1.total} tickets; ${N1.total - N1.inherited} tickets are new to Sprint ${N1.number}.` }, ...cfg.carry.facts].slice(0, 4);
  facts.forEach((f, i) => {
    const y = 3.4 + i * 0.85;
    box(s, 8.0, y, 4.73, 0.75);
    tb(s, f.title, { x: 8.2, y: y + 0.07, w: 4.35, h: 0.28, fontFace: H, fontSize: 12, bold: true, color: C.blue });
    tb(s, f.detail, { x: 8.2, y: y + 0.35, w: 4.35, h: 0.38, fontSize: 8.5, color: C.muted, valign: 'top' });
  });
}

// ================= 8. RISKS =================
{
  const s = pres.addSlide(); header(s, 'Risks & Flags', 'What Needs a Decision Today', 'Colour-coded by urgency: each one has a named next step'); footer(s, 8);
  const n = cfg.risks.length, gap = n <= 4 ? 1.22 : 0.98, rh = n <= 4 ? 1.08 : 0.88;
  cfg.risks.forEach((r, i) => {
    const y = 1.95 + i * gap, col = SEV[r.severity] || C.amber;
    box(s, 0.6, y, 12.13, rh); stripe(s, 0.6, y, rh, col);
    pill(s, r.severity, 0.85, y + rh / 2 - 0.14, 0.85, col, 8);
    tb(s, r.title, { x: 1.9, y: y + 0.12, w: 6.8, h: 0.32, fontFace: H, fontSize: 12.5, bold: true, color: C.ink });
    tb(s, r.detail, { x: 1.9, y: y + 0.46, w: 6.8, h: rh - 0.5, fontSize: 9, color: C.muted, valign: 'top' });
    tb(s, 'Next step: ' + r.nextStep, { x: 8.95, y: y + 0.12, w: 3.6, h: rh - 0.24, fontSize: 9, bold: true, color: C.blue, valign: 'middle' });
  });
}

// ================= 9. RETRO BREAK =================
{
  const s = pres.addSlide(); darkBg(s);
  eyebrow(s, 'Up next', 0.95, 1.35, C.pale);
  tb(s, 'Retrospective', { x: 0.95, y: 1.65, w: 9, h: 1.1, fontFace: H, fontSize: 54, bold: true, color: C.white });
  tb(s, 'Liked  ·  Lacked  ·  Learned', { x: 0.95, y: 2.7, w: 9, h: 0.55, fontFace: H, fontSize: 24, color: C.ice });
  s.addShape(pres.ShapeType.line, { x: 0.95, y: 3.4, w: 2.4, h: 0, line: { color: C.red, width: 1.5 } });
  const steps = ['Silent brainstorm: everyone drops cards, nobody talks', 'Group similar cards', 'Discuss as a team', 'Dot-vote the top 3 action items', 'Assign an owner and a deadline to each'];
  steps.forEach((t, i) => {
    tb(s, String(i + 1), { x: 0.95, y: 3.75 + i * 0.44, w: 0.4, h: 0.4, fontFace: H, fontSize: 15, bold: true, color: C.red, valign: 'middle' });
    tb(s, t, { x: 1.4, y: 3.75 + i * 0.44, w: 6.3, h: 0.4, fontSize: 12.5, color: C.white, valign: 'middle' });
  });
  tb(s, '10 min', { x: 7.7, y: 3.75, w: 0.9, h: 0.4, fontSize: 10.5, bold: true, color: C.pale, valign: 'middle' });
  tb(s, '20 minute block', { x: 0.95, y: 6.05, w: 4, h: 0.3, fontSize: 10.5, bold: true, color: C.pale });
  s.addShape(pres.ShapeType.roundRect, { x: 9.3, y: 3.65, w: 3.45, h: 2.5, fill: { color: C.darkCard }, line: { color: C.darkCard }, rectRadius: 0.06 });
  tb(s, '⚠  A note on timing', { x: 9.55, y: 3.8, w: 3.0, h: 0.35, fontFace: H, fontSize: 13, bold: true, color: C.white });
  tb(s, cfg.retro.timingNote, { x: 9.55, y: 4.18, w: 3.0, h: 1.8, fontSize: 9.5, color: C.ice, valign: 'top' });
}

// ================= 10. RETRO BOARD =================
{
  const s = pres.addSlide(); header(s, 'Retro board', 'Open the Board and Start Dropping Cards', '10 minutes, silent: the timer starts when everyone is in'); footer(s, 10);
  const url = cfg.retro.boardUrl;
  box(s, 0.6, 2.05, 12.13, 1.55, C.light, C.light);
  eyebrow(s, `retrotool.io  ·  Sprint ${S.number} board`, 0.9, 2.2, C.muted, 8);
  tb(s, url, { x: 0.9, y: 2.5, w: 11.5, h: 0.6, fontFace: H, fontSize: 24, bold: true, color: C.blue, valign: 'middle', hyperlink: { url } });
  tb(s, 'Click the link, or type it in: the board is open now.', { x: 0.9, y: 3.15, w: 11.5, h: 0.3, fontSize: 10, italic: true, color: C.muted });
  const cols = [['LIKED', C.green, 'What worked and should keep happening.', cfg.retro.liked], ['LACKED', C.amber, 'What was missing, slow, or in the way.', cfg.retro.lacked], ['LEARNED', C.blue, `What we know now that we did not on ${S.startLong}.`, cfg.retro.learned]];
  cols.forEach((c, i) => {
    const x = 0.6 + i * 4.11;
    box(s, x, 3.85, 3.91, 2.3); s.addShape(pres.ShapeType.rect, { x, y: 3.85, w: 3.91, h: 0.09, fill: { color: c[1] }, line: { color: c[1] } });
    tb(s, c[0], { x: x + 0.2, y: 4.05, w: 3.5, h: 0.4, fontFace: H, fontSize: 18, bold: true, color: c[1] });
    tb(s, c[2], { x: x + 0.2, y: 4.5, w: 3.5, h: 0.3, fontSize: 10, bold: true, color: C.ink });
    tb(s, c[3], { x: x + 0.2, y: 4.82, w: 3.5, h: 1.2, fontSize: 9, color: C.muted, valign: 'top' });
  });
  s.addShape(pres.ShapeType.rect, { x: 0.6, y: 6.35, w: 12.13, h: 0.45, fill: { color: C.dark }, line: { color: C.dark } });
  tb(s, 'Ground rules:   no talking during the brainstorm   ·   cards are about the work, not the people   ·   every action item leaves with an owner and a date', { x: 0.6, y: 6.35, w: 12.13, h: 0.45, fontSize: 9.5, color: C.white, align: 'center', valign: 'middle' });
}

const out = `${cfg.project}_Sprint${S.number}_Review_Retro_${cfg.meeting.dateISO}.pptx`;
pres.writeFile({ fileName: out }).then(() => console.log('wrote', out, `| ${total} tickets, ${M.done} closed, ${M.carry} carry`));
