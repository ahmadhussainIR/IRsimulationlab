const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function model() {
  const context = {window: {dispatchEvent() {}}, CustomEvent: class {}, document: {hidden: false}, performance: {now: () => 0}};
  vm.createContext(context);
  for (const file of ['navigation.js', 'anatomy-data.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context);
  return {nav: context.window.IRNavigation, atlas: context.window.IRAnatomyData};
}

const plain = value => JSON.parse(JSON.stringify(value));

function verifyGraph(graph, root) {
  const visited = new Set();
  function visit(id, ancestors = new Set()) {
    assert(graph[id], 'Branch exists: ' + id);
    assert(!ancestors.has(id), 'No cycle through ' + id);
    if (visited.has(id)) return;
    visited.add(id);
    const node = graph[id];
    assert(node.name && node.territory, 'Branch has a name and territory: ' + id);
    assert(node.caliber > 0 && Number.isFinite(node.caliber));
    assert(node.points.length >= 2);
    for (const point of node.points) {
      assert.equal(point.length, 2);
      assert(point.every(value => Number.isFinite(value) && value >= 0 && value <= 1024), 'Coordinates fit the atlas: ' + id);
    }
    assert.equal(new Set(node.children).size, node.children.length, 'No duplicate children: ' + id);
    for (const child of node.children) {
      assert.equal(graph[child]?.parent, id, 'Parent and child agree: ' + child);
      visit(child, new Set([...ancestors, id]));
    }
  }
  assert.equal(graph[root].parent, null);
  visit(root);
  assert.equal(visited.size, Object.keys(graph).length, 'Every branch is connected to the root');
}

test('All hepatic examples and bilateral renal branches have finite, connected, acyclic graphs', () => {
  const {atlas} = model();
  for (const variant of ['typical', 'rha-sma', 'lha-gastric']) verifyGraph(atlas.liver(variant), 'h_aorta');
  verifyGraph(atlas.renal(), 'k_aorta');
});

test('Replaced hepatic origins reconnect their whole branch family and preserve the other side', () => {
  const {atlas} = model();
  const typical = atlas.liver();
  const right = atlas.liver('rha-sma');
  assert.deepEqual(plain(atlas.route(right, 'h_right_post')), ['h_aorta', 'h_sma', 'h_right', 'h_right_post']);
  assert(!right.h_proper.children.includes('h_right'));
  assert(right.h_sma.children.includes('h_right'));
  assert.deepEqual(plain(right.h_left), plain(typical.h_left));
  const left = atlas.liver('lha-gastric');
  assert.deepEqual(plain(atlas.route(left, 'h_left_lateral')), ['h_aorta', 'h_celiac', 'h_gastric', 'h_left', 'h_left_lateral']);
  assert(!left.h_proper.children.includes('h_left'));
  assert(left.h_gastric.children.includes('h_left'));
  assert.deepEqual(plain(left.h_right), plain(typical.h_right));
  right.h_right.points[0][0] = -1;
  right.h_sma.children.length = 0;
  assert.deepEqual(plain(atlas.liver()), plain(typical), 'Inspecting or editing one example cannot leak into another');
});

test('Renal examples keep anterior segmental branches separate from the posterior branch on both sides', () => {
  const {atlas} = model();
  const graph = atlas.renal();
  for (const side of ['r', 'l']) {
    assert.deepEqual(plain(graph[side + '_renal'].children), [side + '_renal_anterior', side + '_renal_posterior']);
    const anterior = graph[side + '_renal_anterior'];
    assert.deepEqual(plain(anterior.children), ['apical', 'upper', 'middle', 'lower'].map(name => side + '_renal_' + name));
    for (const child of anterior.children) assert.deepEqual(plain(atlas.route(graph, child)), ['k_aorta', side + '_renal', side + '_renal_anterior', child]);
    assert.deepEqual(plain(atlas.route(graph, side + '_renal_posterior')), ['k_aorta', side + '_renal', side + '_renal_posterior']);
  }
});

test('Every regional atlas stays inside its selected region across PAE origin examples', () => {
  const {nav, atlas} = model();
  for (const variant of ['direct', 'vesical', 'obturator', 'pudendal', 'dual']) {
    nav.reset('Femoral', 'pae', variant);
    for (const region of ['knee', 'pelvis', 'thigh', 'abdomen', 'chest']) {
      const graph = atlas.graph(region, nav);
      assert(Object.keys(graph).length > 0);
      for (const [id, branch] of Object.entries(graph)) {
        assert.equal(branch.region, region);
        for (const child of branch.children) assert(graph[child], region + ' has no dangling branch ' + child);
        const route = atlas.route(graph, id);
        assert.equal(route.at(-1), id);
        assert.equal(new Set(route).size, route.length);
        assert(route.every(key => graph[key]));
      }
    }
  }
});

test('Atlas inspection and independent coordinate edits leave devices and the navigation graph unchanged', () => {
  const {nav, atlas} = model();
  nav.move(1);
  nav.setTorque(nav.nodes.sfa.angle);
  assert(nav.enter('sfa'));
  nav.move(1);
  nav.setTool('microcatheter');
  assert(nav.seat());
  const stateBefore = plain(nav.get()), nodesBefore = plain(nav.nodes);
  for (const region of Object.keys(atlas.regions)) {
    const graph = atlas.graph(region, nav);
    for (const id of Object.keys(graph)) atlas.route(graph, id);
    const branch = Object.values(graph)[0];
    branch.points[0][0] = -100;
    branch.children.push('atlas-only-example');
    branch.name = 'Changed only in this atlas copy';
  }
  assert.deepEqual(plain(nav.get()), stateBefore);
  assert.deepEqual(plain(nav.nodes), nodesBefore);
});

test('A fresh pelvic atlas follows the selected PAE origin while an earlier snapshot remains unchanged', () => {
  const {nav, atlas} = model();
  nav.reset('Femoral', 'pae', 'direct');
  const direct = atlas.graph('pelvis', nav);
  const directSnapshot = plain(direct);
  nav.reset('Femoral', 'pae', 'dual');
  const dual = atlas.graph('pelvis', nav);
  for (const side of ['r', 'l']) {
    assert.equal(direct[side + '_prostate'].parent, side + '_anterior');
    assert.equal(dual[side + '_prostate'].parent, side + '_vesical');
    assert.equal(dual[side + '_capsular'].parent, side + '_pudendal');
  }
  assert.deepEqual(plain(direct), directSnapshot);
});

test('Procedure defaults point to an available reference region, including fallback procedures', () => {
  const {atlas} = model();
  for (const [procedure, region] of Object.entries({gae: 'knee', pae: 'pelvis', y90: 'hepatic', tace: 'hepatic', nephrostomy: 'renal', angioplasty: 'thigh', picc: 'chest', unknown: 'abdomen'})) {
    assert.equal(atlas.recommended(procedure), region);
    assert(atlas.regions[region]);
  }
});
