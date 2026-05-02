const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

const products = [
  {
    id:"richwood-abete-lettonia",
    name:"Richwood Abete Lettonia",
    price:476,
    unit:"bancale (70 sacchi)",
  }
];

let cart = JSON.parse('[{"id":"old-product","qty":1}]').filter(item => products.some(p => p.id === item.id));

console.log(cart);
