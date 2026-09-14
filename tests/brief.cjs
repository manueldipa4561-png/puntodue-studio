const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../brief.js'), 'utf8');
const businesses = ['un’attività o un’impresa', 'un’attività professionale', 'un ristorante o un locale'];
const needs = ['creare un nuovo sito', 'rinnovare il sito che uso oggi', 'capire quale sito potrebbe servirmi'];
for (const business of businesses) {
  for (const need of needs) {
    const message = {}, manuel = {}, nicolas = {};
    let change; let routedSelector;
    const choice = { value: need };
    const nodes = { '#brief-message': message, '#brief-manuel': manuel, '#brief-nicolas': nicolas,
      'input[name="business"]:checked': { value: business }, 'input[name="need"]:checked': choice };
    const brief = { hidden: true, querySelector: s => nodes[s], addEventListener: (_, fn) => change = fn };
    const links = [0,1,2].map(() => ({ href: '#contatti', setAttribute(_, value) { this.href = value; } }));
    const document = {
      querySelector: () => brief,
      querySelectorAll: selector => { routedSelector = selector; return links; }
    };
    vm.runInNewContext(source, { document, encodeURIComponent });
    assert.equal(routedSelector, '.brief-start');
    assert(links.every(link => link.href === '#progetto'));
    assert.equal(brief.hidden, false);
    for (const [link, number] of [[manuel, '393248423657'], [nicolas, '393248165947']]) {
      const url = new URL(link.href);
      assert.equal(url.hostname, 'wa.me'); assert.equal(url.pathname, '/' + number);
      assert.equal(url.searchParams.get('text'), message.textContent);
      assert(message.textContent.includes(business)); assert(message.textContent.includes(need));
    }
    choice.value = 'rinnovare il sito che uso oggi'; change();
    assert(message.textContent.includes(choice.value));
  }
}
console.log('PASS current nine brief combinations, both recipients, encoding and CTA routing');
