const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

const products = [
  {
    id:"hitze-pellet",
    name:"Hitze Pellet",
    price:462,
    unit:"bancale (70 sacchi)",
  }
];

let cart = JSON.parse('[{"id":"old-product","qty":1}]').filter(item => products.some(p => p.id === item.id));

console.log(cart);
