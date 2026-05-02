const WHATSAPP_NUMBER = "393289361775";

const products = [
  {
    id:"abete-bianco",
    name:"Pellet Abete Bianco",
    description:"Ottimo per uso domestico, resa pulita e consegna programmata.",
    price:6.50,
    unit:"sacco",
    pack:"Bancale 65 sacchi",
    image:"assets/pellet-abete-bianco.jpg",
    tags:["15 kg","ENplus A1","Pagamento alla consegna"]
  },
  {
    id:"abete-rosso",
    name:"Pellet Abete Rosso",
    description:"Prodotto premium, ideale per chi cerca qualità e continuità.",
    price:7.20,
    unit:"sacco",
    pack:"Bancale 72 sacchi",
    image:"assets/pellet-abete-rosso.jpg",
    tags:["15 kg","Alta resa","Offerta bancale"]
  },
  {
    id:"misto-faggio",
    name:"Pellet Misto Faggio",
    description:"Soluzione conveniente per riscaldamento quotidiano.",
    price:6.20,
    unit:"sacco",
    pack:"Disponibile a sacchi o bancale",
    image:"assets/pellet-misto.jpg",
    tags:["15 kg","Conveniente","Consegna casa"]
  }
];

let cart = JSON.parse(localStorage.getItem("newpellet_cart") || "[]");
let deferredPrompt = null;

const euro = n => n.toLocaleString("it-IT",{style:"currency",currency:"EUR"});
const $ = s => document.querySelector(s);

function toast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2600);
}

function saveCart(){
  localStorage.setItem("newpellet_cart", JSON.stringify(cart));
  renderCart();
}

function renderProducts(){
  const grid = $("#productsGrid");
  grid.innerHTML = products.map(p => `
    <article class="product">
      <img src="${p.image}" alt="${p.name}">
      <div class="productBody">
        <div class="productTop">
          <div>
            <h3>${p.name}</h3>
            <p>${p.description}</p>
          </div>
          <div class="price">${euro(p.price)}</div>
        </div>
        <div class="chips">${p.tags.map(t=>`<span class="chip">${t}</span>`).join("")}</div>
        <p><strong>${p.pack}</strong></p>
        <div class="qtyRow">
          <button onclick="changeQty('${p.id}',-1)">−</button>
          <input id="qty-${p.id}" type="number" min="1" value="1">
          <button onclick="changeQty('${p.id}',1)">+</button>
          <button class="addBtn" onclick="addToCart('${p.id}')">Aggiungi</button>
        </div>
      </div>
    </article>
  `).join("");
}

window.changeQty = function(id, delta){
  const input = document.getElementById(`qty-${id}`);
  input.value = Math.max(1, Number(input.value || 1) + delta);
}

window.addToCart = function(id){
  const p = products.find(x=>x.id===id);
  const qty = Number(document.getElementById(`qty-${id}`).value || 1);
  const existing = cart.find(x=>x.id===id);
  if(existing) existing.qty += qty;
  else cart.push({id:p.id, qty});
  saveCart();
  toast(`${p.name} aggiunto all’ordine`);
}

function renderCart(){
  $("#cartCount").textContent = cart.reduce((s,i)=>s+i.qty,0);
  const items = $("#cartItems");
  if(!cart.length){
    items.innerHTML = `<p class="fineprint">Nessun prodotto selezionato.</p>`;
  } else {
    items.innerHTML = cart.map(item=>{
      const p = products.find(x=>x.id===item.id);
      return `<div class="cartLine">
        <div><strong>${p.name}</strong><br><small>${item.qty} ${p.unit} × ${euro(p.price)}</small></div>
        <div><strong>${euro(item.qty*p.price)}</strong><br><button onclick="removeFromCart('${item.id}')">Rimuovi</button></div>
      </div>`;
    }).join("");
  }
  const total = cart.reduce((s,item)=>{
    const p = products.find(x=>x.id===item.id);
    return s + item.qty * p.price;
  },0);
  $("#cartTotal").textContent = euro(total);
}

window.removeFromCart = function(id){
  cart = cart.filter(x=>x.id!==id);
  saveCart();
}

function openCart(){ $("#cartPanel").classList.add("open"); $("#cartPanel").setAttribute("aria-hidden","false"); }
function closeCart(){ $("#cartPanel").classList.remove("open"); $("#cartPanel").setAttribute("aria-hidden","true"); }

function sendWhatsapp(){
  if(!cart.length){ toast("Seleziona almeno un prodotto"); return; }
  const name = $("#customerName").value.trim();
  const address = $("#customerAddress").value.trim();
  const notes = $("#customerNotes").value.trim();

  const lines = cart.map(item=>{
    const p = products.find(x=>x.id===item.id);
    return `• ${p.name}: ${item.qty} ${p.unit} (${euro(p.price)} cad.)`;
  }).join("%0A");

  const total = cart.reduce((s,item)=>{
    const p = products.find(x=>x.id===item.id);
    return s + item.qty * p.price;
  },0);

  const msg =
`Ciao Newpellet, vorrei ordinare:%0A${lines}%0A%0ATotale indicativo: ${encodeURIComponent(euro(total))}%0A`+
`Nome: ${encodeURIComponent(name || "-")}%0A`+
`Indirizzo/Comune: ${encodeURIComponent(address || "-")}%0A`+
`Note: ${encodeURIComponent(notes || "-")}%0A%0A`+
`Attendo conferma disponibilità e consegna.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

async function registerServiceWorker(){
  if("serviceWorker" in navigator){
    try{ await navigator.serviceWorker.register("sw.js"); }
    catch(e){ console.warn("Service worker non registrato", e); }
  }
}

async function enableNotifications(){
  if(!("Notification" in window)){
    toast("Notifiche non supportate su questo dispositivo");
    return;
  }
  const permission = await Notification.requestPermission();
  if(permission !== "granted"){
    toast("Notifiche non attivate");
    return;
  }
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification("Newpellet offerte attive", {
    body:"Riceverai gli aggiornamenti quando saranno disponibili nuove offerte.",
    icon:"assets/icon-192.png",
    badge:"assets/icon-192.png",
    tag:"newpellet-offerte"
  });

  if("PushManager" in window){
    try {
      const res = await fetch('/.netlify/functions/vapid-public-key');
      const { publicKey } = await res.json();
      
      const padding = '='.repeat((4 - publicKey.length % 4) % 4);
      const base64 = (publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray
      });
      
      await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      console.log("Iscrizione Push inviata con successo");
    } catch(e) {
      console.error("Errore configurazione Push", e);
    }
  }
}

window.addEventListener("beforeinstallprompt", e=>{
  e.preventDefault();
  deferredPrompt = e;
  $("#installBtn").classList.remove("hidden");
});

$("#installBtn").addEventListener("click", async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("#installBtn").classList.add("hidden");
});

$("#openCartBtn").addEventListener("click", openCart);
$("#quickOrderBtn").addEventListener("click", openCart);
$("#closeCartBtn").addEventListener("click", closeCart);
$("#sendWhatsappBtn").addEventListener("click", sendWhatsapp);
$("#notifyBtn").addEventListener("click", openNewsletterModal);
$("#notifyBtn2").addEventListener("click", openNewsletterModal);

renderProducts();
renderCart();
registerServiceWorker();

window.closeNewsletterModal = function() {
  document.getElementById("newsletterModal").classList.remove("active");
};

function openNewsletterModal() {
  document.getElementById("newsletterModal").classList.add("active");
}

document.getElementById("newsletterForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (response.ok) {
      toast("Iscrizione completata!");
      closeNewsletterModal();
      // Now enable notifications
      await enableNotifications();
    } else {
      toast("Errore durante l'iscrizione.");
    }
  } catch (error) {
    toast("Errore di rete.");
  }
});
