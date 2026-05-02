const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

const products = [
  {
    id:"richwood-abete-lettonia",
    name:"Richwood Abete Lettonia",
    price:476,
    unit:"bancale (70 sacchi)",
  },
  {
    id:"hitze-pellet",
    name:"Hitze Pellet",
    price:455,
    unit:"bancale (70 sacchi)",
  },
  {
    id:"timber-abete-bianco-tedesco",
    name:"Timber Pellet Abete Bianco Tedesco",
    price:476,
    unit:"bancale (70 sacchi)",
  }
];

let cart = [{ id: 'hitze-pellet', qty: 1 }];
const $ = () => ({ value: 'entro80' });

function getCartTotal() {
  let total = cart.reduce((s,item)=>{
    const p = products.find(x=>x.id===item.id);
    return s + item.qty * p.price;
  },0);
  
  const distance = $("#customerDistance") ? $("#customerDistance").value : "entro80";
  if (distance === "oltre80") {
    let totalPallets = cart.reduce((s,item) => {
      const p = products.find(x=>x.id===item.id);
      if (p.unit.includes("bancale")) return s + item.qty;
      return s + (item.qty / 70);
    }, 0);
    total += Math.ceil(totalPallets) * 15;
  }
  return total;
}

console.log('Total:', getCartTotal());

cart = [{ id: 'old-product', qty: 1 }];
try {
  console.log('Total old:', getCartTotal());
} catch(e) {
  console.error('Error old:', e.message);
}
