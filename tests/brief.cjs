const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../contact-brief.js'), 'utf8');
const needs = [
  ['un nuovo sito', 'creare un nuovo sito'],
  ['un redesign del sito attuale', 'ripensare il sito che uso oggi'],
  ['un progetto ecommerce', 'realizzare un progetto ecommerce'],
  ['capire quale soluzione web è più adatta', 'capire quale soluzione web sia più adatta'],
];
const stages = [
  'non ho ancora un sito',
  'ho già un sito che vorrei migliorare',
  'sto avviando un nuovo progetto',
  'voglio riposizionare il business online',
];

for (const [needValue, needPhrase] of needs) {
  for (const stageValue of stages) {
    const message = { textContent: '' };
    const manuel = { href: '' };
    const nicolas = { href: '' };
    const changeHandlers = [];
    const needInputs = needs.map(([value]) => ({
      name: 'need', value, checked: value === needValue,
      addEventListener(type, fn) { if (type === 'change') changeHandlers.push(fn); }
    }));
    const stageInputs = stages.map(value => ({
      name: 'stage', value, checked: value === stageValue,
      addEventListener(type, fn) { if (type === 'change') changeHandlers.push(fn); }
    }));

    const document = {
      querySelectorAll(selector) {
        if (selector === 'input[name="need"]') return needInputs;
        if (selector === 'input[name="stage"]') return stageInputs;
        return [];
      },
      querySelector(selector) {
        if (selector === '#brief-message') return message;
        if (selector === '#brief-manuel') return manuel;
        if (selector === '#brief-nicolas') return nicolas;
        return null;
      }
    };

    vm.runInNewContext(source, { document, encodeURIComponent });

    assert(message.textContent.includes(needPhrase), `${needValue} was not translated correctly`);
    assert(message.textContent.includes(stageValue), `${stageValue} missing from message`);
    for (const [link, number] of [[manuel, '393248423657'], [nicolas, '393248165947']]) {
      const url = new URL(link.href);
      assert.equal(url.hostname, 'wa.me');
      assert.equal(url.pathname, '/' + number);
      assert.equal(url.searchParams.get('text'), message.textContent);
    }
    assert.equal(changeHandlers.length, needInputs.length + stageInputs.length);
  }
}

console.log('PASS production contact brief: 16 combinations, both recipients, encoding and change listeners');
