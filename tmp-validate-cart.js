const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('client/js/cart.js', 'utf8');
const localStorage = { store: {} };
const sessionStorage = { store: {} };
localStorage.getItem = (k) => Object.prototype.hasOwnProperty.call(localStorage.store, k) ? localStorage.store[k] : null;
localStorage.setItem = (k, v) => { localStorage.store[k] = String(v); };
sessionStorage.getItem = (k) => Object.prototype.hasOwnProperty.call(sessionStorage.store, k) ? sessionStorage.store[k] : null;
sessionStorage.setItem = (k, v) => { sessionStorage.store[k] = String(v); };
sessionStorage.removeItem = (k) => { delete sessionStorage.store[k]; };
const sandbox = {
  console,
  getCurrentUser: () => ({ _id: 'u1' }),
  localStorage,
  sessionStorage,
  document: {
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({}),
    addEventListener: () => {},
    body: {}
  },
  window: { clearTimeout: () => {}, setTimeout: () => {}, location: { href: '' } },
  showToast: () => {},
  JSON, Number, Math, Array, Object, String, parseFloat, Date,
  setTimeout: () => {},
  clearTimeout: () => {},
  location: { href: '' }
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const merged = sandbox.mergeCartItems(
  [{ productId: 'p1', name: 'תפוז', quantity: 1 }, { productId: 'p2', name: 'עגבניה', quantity: 2 }],
  [{ productId: 'p1', name: 'תפוז', quantity: 3 }, { productId: 'p3', name: 'תפוז', quantity: 1 }]
);
if (merged.length !== 3) throw new Error('expected 3 items after merge');
if (merged[0].quantity !== 4) throw new Error('product p1 quantity should be aggregated to 4');
if (merged[2].quantity !== 1) throw new Error('new product should be added');
console.log('cart merge validation passed:', JSON.stringify(merged));
