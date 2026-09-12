const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../brief.js'), 'utf8');
for (const business of ['un ristorante', 'un bar o un pub', 'un’altra attività locale']) {
  for (const need of ['creare il mio primo sito', 'rinnovare il sito esistente', 'capire quale sito potrebbe servirmi']) {
    const message = {}, manuel = {}, nicolas = {};
    let change;
    const choice = { value: need };
    const nodes = { '#brief-message': message, '#brief-manuel': manuel, '#brief-nicolas': nicolas,
      'input[name="business"]:checked': { value: business }, 'input[name="need"]:checked': choice };
    const brief = { hidden: true, querySelector: s => nodes[s], addEventListener: (_, fn) => change = fn };
    const links = [0,1,2].map(() => ({ href: '#contatti', setAttribute(_, value) { this.href = value; } }));
    vm.runInNewContext(source, { document: { querySelector: () => brief, querySelectorAll: () => links }, encodeURIComponent });
    assert(links.every(link => link.href === '#progetto'));
    assert.equal(brief.hidden, false);
    for (const [link, number] of [[manuel, '393248423657'], [nicolas, '393248165947']]) {
      const url = new URL(link.href);
      assert.equal(url.hostname, 'wa.me'); assert.equal(url.pathname, '/' + number);
      assert.equal(url.searchParams.get('text'), message.textContent);
      assert(message.textContent.includes(business)); assert(message.textContent.includes(need));
    }
    choice.value = 'rinnovare il sito esistente'; change();
    assert(message.textContent.includes(choice.value));
  }
}
console.log('PASS all nine brief combinations, both recipients, encoding and change events');
