/* Sortmart - simple JavaScript. Data is saved in the browser (localStorage), so no server is needed. */

/* ---------- small helpers ---------- */
const $ = id => document.getElementById(id);
const money = n => "₹" + n.toLocaleString("en-IN");
const load = (key, fallback) => { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const find = id => products.find(p => p.id === Number(id));
const esc = s => String(s).replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");

/* ---------- saved data ---------- */
let cart = load("cart", {});       // { productId: quantity }
let wish = load("wish", []);       // [productId, productId, ...]
let coupon = load("coupon", "");   // applied coupon code
let users = load("users", []);     // registered users
let afterLogin = null;             // what to do once the user logs in
let state = { cat: "All", q: "", maxPrice: 0, sort: "featured", algo: "merge" };

const currentUser = () => users.find(u => u.email === load("session", ""));

/* Demo-only password scrambler. A real website must hash passwords on a server. */
const hash = s => { let h = 5381; for (const c of s) h = (h * 33) ^ c.charCodeAt(0); return String(h >>> 0); };

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- sorting algorithms (cmp returns a number: >0 means a goes after b) ---------- */
function bubbleSort(list, cmp) {
  const a = [...list];
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a.length - i - 1; j++)
      if (cmp(a[j], a[j + 1]) > 0) [a[j], a[j + 1]] = [a[j + 1], a[j]];
  return a;
}
function insertionSort(list, cmp) {
  const a = [...list];
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0 && cmp(a[j], x) > 0) { a[j + 1] = a[j]; j--; }
    a[j + 1] = x;
  }
  return a;
}
function mergeSort(a, cmp) {
  if (a.length < 2) return a;
  const mid = a.length >> 1;
  const left = mergeSort(a.slice(0, mid), cmp), right = mergeSort(a.slice(mid), cmp);
  const out = [];
  while (left.length && right.length) out.push(cmp(left[0], right[0]) <= 0 ? left.shift() : right.shift());
  return [...out, ...left, ...right];
}
function quickSort(a, cmp) {
  if (a.length < 2) return a;
  const pivot = a[0], rest = a.slice(1);
  return [...quickSort(rest.filter(x => cmp(x, pivot) < 0), cmp), pivot, ...quickSort(rest.filter(x => cmp(x, pivot) >= 0), cmp)];
}
const sorters = { bubble: bubbleSort, insertion: insertionSort, merge: mergeSort, quick: quickSort };
const algoNames = { bubble: "bubble sort", insertion: "insertion sort", merge: "merge sort", quick: "quick sort" };

/* ---------- shop page ---------- */
function renderChips() {
  $("chips").innerHTML = ["All", ...Object.keys(cats)].map(c =>
    `<button class="${state.cat === c ? "on" : ""}" onclick="state.cat='${c}'; renderChips(); showShop()">${c === "All" ? "🛍️" : cats[c].icon} ${c}</button>`).join("");
}

function showShop() {
  // 1. search (linear search through every product) and filters
  const q = state.q.toLowerCase();
  let list = products.filter(p =>
    (state.cat === "All" || p.cat === state.cat) &&
    (!state.maxPrice || p.price <= state.maxPrice) &&
    (p.name + " " + p.cat).toLowerCase().includes(q));

  // 2. sort with the chosen algorithm
  if (state.sort !== "featured") {
    const key = state.sort.split("-")[0];
    const dir = state.sort.endsWith("desc") ? -1 : 1;
    list = sorters[state.algo](list, (a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir);
  }

  $("count").textContent = list.length + " products" + (state.sort !== "featured" ? ", sorted with " + algoNames[state.algo] : "");
  $("grid").innerHTML = list.length ? list.map(card).join("") : `<p class="empty">No products found. Try another word or category.</p>`;
}

function card(p) {
  const off = Math.round((1 - p.price / p.mrp) * 100);
  return `<article class="card">
    <button class="heart ${wish.includes(p.id) ? "on" : ""}" onclick="toggleWish(${p.id})" aria-label="Save to wishlist">♥</button>
    <div class="pic" style="background:${cats[p.cat].bg}" onclick="openProduct(${p.id})">${p.icon}<span class="off">${off}% off</span></div>
    <div class="info">
      <small>${p.cat}</small>
      <h3>${p.name}</h3>
      <div class="rate">★ ${p.rating} <span>(${p.sold.toLocaleString("en-IN")})</span></div>
      <div class="price"><b>${money(p.price)}</b><s>${money(p.mrp)}</s></div>
      <button class="btn" onclick="addToCart(${p.id})">Add to cart</button>
    </div></article>`;
}

$("search").addEventListener("input", e => { state.q = e.target.value; showShop(); });
$("price").addEventListener("change", e => { state.maxPrice = Number(e.target.value); showShop(); });
$("sort").addEventListener("change", e => { state.sort = e.target.value; showShop(); });
$("algo").addEventListener("change", e => { state.algo = e.target.value; showShop(); });

/* ---------- popup window and drawer ---------- */
function openModal(html) {
  $("box").innerHTML = `<button class="x" onclick="closeModal()" aria-label="Close">×</button>` + html;
  $("modal").hidden = false;
}
function closeModal() { $("modal").hidden = true; }
function closeDrawer() { $("drawer").classList.remove("open"); $("shade").classList.remove("show"); }
function closeAll() { closeModal(); closeDrawer(); }
$("modal").addEventListener("click", e => { if (e.target === $("modal")) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

/* ---------- product details ---------- */
function openProduct(id) {
  const p = find(id);
  openModal(`<div class="pd">
    <small class="note">${p.cat}</small>
    <h2>${p.name}</h2>
    <div class="pic" style="background:${cats[p.cat].bg}">${p.icon}</div>
    <div class="rate">★ ${p.rating} <span>(${p.sold.toLocaleString("en-IN")} reviews)</span></div>
    <p class="note">${p.desc}</p>
    <div class="price"><b>${money(p.price)}</b><s>${money(p.mrp)}</s></div>
    <button class="btn" onclick="addToCart(${p.id}); closeModal()">Add to cart</button>
    <button class="btn line" onclick="addToCart(${p.id}); closeModal(); startCheckout()">Buy now</button>
  </div>`);
}

/* ---------- wishlist ---------- */
function toggleWish(id) {
  wish = wish.includes(id) ? wish.filter(w => w !== id) : [...wish, id];
  save("wish", wish);
  updateCounts();
  showShop();
  if (!$("modal").hidden && $("box").textContent.includes("My wishlist")) showWishlist();
}
function showWishlist() {
  const items = wish.map(find);
  openModal(`<h2>My wishlist</h2>` + (items.length ? items.map(p => `
    <div class="item">
      <div class="ic" style="background:${cats[p.cat].bg}">${p.icon}</div>
      <div><b>${p.name}</b><br>${money(p.price)}</div>
      <div><button class="link" onclick="addToCart(${p.id})">Add to cart</button><br><button class="note" onclick="toggleWish(${p.id})">Remove</button></div>
    </div>`).join("") : `<p class="note">Tap the ♥ on any product to save it here.</p>`));
}

/* ---------- cart ---------- */
function updateCounts() {
  $("ccount").textContent = Object.values(cart).reduce((a, b) => a + b, 0);
  $("wcount").textContent = wish.length;
}
function saveCart() { save("cart", cart); updateCounts(); }
function addToCart(id, qty = 1) {
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  toast(find(id).name + " added to cart");
  if ($("drawer").classList.contains("open")) renderCart();
}
function changeQty(id, change) {
  cart[id] += change;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}
function totals() {
  let sub = 0;
  for (const id in cart) sub += find(id).price * cart[id];
  const c = coupons[coupon];
  const discount = c ? (c.type === "pct" ? Math.round(sub * c.value / 100) : Math.min(c.value, sub)) : 0;
  const delivery = sub - discount >= 499 || sub === 0 ? 0 : 49;
  return { sub, discount, delivery, total: sub - discount + delivery };
}
function applyCoupon() {
  const code = $("couponInput").value.trim().toUpperCase();
  if (!coupons[code]) return toast("That coupon code is not valid");
  coupon = code;
  save("coupon", coupon);
  toast("Coupon applied: " + coupons[code].text);
  renderCart();
}
function removeCoupon() { coupon = ""; save("coupon", ""); renderCart(); }

function renderCart() {
  const ids = Object.keys(cart), t = totals();
  const items = ids.map(id => {
    const p = find(id);
    return `<div class="item">
      <div class="ic" style="background:${cats[p.cat].bg}">${p.icon}</div>
      <div><b>${p.name}</b><br>${money(p.price)}
        <div class="qty"><button onclick="changeQty(${id},-1)" aria-label="Less">−</button>${cart[id]}<button onclick="changeQty(${id},1)" aria-label="More">+</button></div></div>
      <b>${money(p.price * cart[id])}</b></div>`;
  }).join("");

  $("drawer").innerHTML = `
    <div class="dh"><h2>Your cart</h2><button class="x" style="position:static" onclick="closeDrawer()" aria-label="Close">×</button></div>
    <div class="db">${ids.length ? items : `<p class="note" style="padding:30px 0;text-align:center">Your cart is empty.<br>Add something you like!</p>`}</div>
    ${ids.length ? `<div class="df">
      ${coupon ? `<p class="sum"><span>Coupon <b>${coupon}</b> applied</span><button class="link" onclick="removeCoupon()">Remove</button></p>`
               : `<div class="coupon"><input id="couponInput" placeholder="Coupon code"><button class="btn line" onclick="applyCoupon()">Apply</button></div>`}
      <div class="sum"><span>Subtotal</span><span>${money(t.sub)}</span></div>
      ${t.discount ? `<div class="sum"><span>Discount</span><span>− ${money(t.discount)}</span></div>` : ""}
      <div class="sum"><span>Delivery</span><span>${t.delivery ? money(t.delivery) : "Free"}</span></div>
      <div class="sum total"><span>Total</span><span>${money(t.total)}</span></div>
      <button class="btn big" onclick="startCheckout()">Checkout</button></div>` : ""}`;
}
function openCart() {
  renderCart();
  $("drawer").classList.add("open");
  $("shade").classList.add("show");
}

/* ---------- register, login, account ---------- */
function updateUserBtn() {
  const u = currentUser();
  $("userBtn").textContent = u ? "Hi, " + u.name.split(" ")[0] : "Log in";
}

function showAuth(mode = "login", msg = "") {
  const reg = mode === "register";
  openModal(`
    <h2>${reg ? "Create your account" : "Welcome back"}</h2>
    ${msg ? `<p class="note">${msg}</p>` : ""}
    <div class="tabs">
      <button class="${reg ? "" : "on"}" onclick="showAuth('login')">Log in</button>
      <button class="${reg ? "on" : ""}" onclick="showAuth('register')">Register</button>
    </div>
    ${reg ? `<label>Full name<input id="aName" autocomplete="name"></label>` : ""}
    <label>Email<input id="aEmail" type="email" autocomplete="email"></label>
    <label>Password<input id="aPass" type="password" autocomplete="${reg ? "new-password" : "current-password"}"></label>
    ${reg ? `<label>Confirm password<input id="aPass2" type="password" autocomplete="new-password"></label>` : ""}
    <p class="error" id="aErr" role="alert"></p>
    <button class="btn big" onclick="${reg ? "register()" : "login()"}">${reg ? "Create account" : "Log in"}</button>`);
}

function register() {
  const name = $("aName").value.trim(), email = $("aEmail").value.trim().toLowerCase(), pass = $("aPass").value;
  const error = !name ? "Please enter your name."
    : !/^\S+@\S+\.\S+$/.test(email) ? "Enter a valid email address."
    : pass.length < 6 ? "Password must have at least 6 characters."
    : pass !== $("aPass2").value ? "The two passwords do not match."
    : users.some(u => u.email === email) ? "This email is already registered. Please log in." : "";
  if (error) { $("aErr").textContent = error; return; }
  users.push({ name, email, pass: hash(pass) });
  save("users", users);
  startSession(email);
}

function login() {
  const email = $("aEmail").value.trim().toLowerCase();
  const user = users.find(u => u.email === email && u.pass === hash($("aPass").value));
  if (!user) { $("aErr").textContent = "Wrong email or password."; return; }
  startSession(email);
}

function startSession(email) {
  save("session", email);
  updateUserBtn();
  closeModal();
  toast("Welcome, " + currentUser().name.split(" ")[0] + "!");
  if (afterLogin) { const next = afterLogin; afterLogin = null; next(); }
}

function logout() {
  localStorage.removeItem("session");
  updateUserBtn();
  closeModal();
  toast("You are logged out");
}

function orderHtml(o) {
  return `<div class="order"><b>${o.id}</b> <span class="note">on ${o.date}</span><br>
    ${o.items.map(i => `${i.icon} ${i.name} × ${i.qty}`).join("<br>")}
    <br><b>Total ${money(o.total)}</b> <span class="note">(${o.pay})</span></div>`;
}

function showAccount() {
  const u = currentUser();
  if (!u) return showAuth();
  const orders = load("orders", []).filter(o => o.email === u.email);
  openModal(`<h2>Hi, ${esc(u.name)}</h2><p class="note">${esc(u.email)}</p>
    <h3 style="margin-top:18px">My orders</h3>
    ${orders.length ? orders.map(orderHtml).join("") : `<p class="note">You have not placed any orders yet.</p>`}
    <button class="btn line" onclick="logout()">Log out</button>`);
}

/* ---------- checkout ---------- */
function startCheckout() {
  if (!Object.keys(cart).length) return toast("Your cart is empty");
  closeDrawer();
  if (!currentUser()) { afterLogin = showCheckout; return showAuth("login", "Log in or register to place your order."); }
  showCheckout();
}

function showCheckout() {
  const t = totals(), u = currentUser();
  openModal(`<h2>Checkout</h2>
    <p class="note">${Object.keys(cart).length} item(s). Total to pay: <b>${money(t.total)}</b></p>
    <label>Full name<input id="cName" value="${esc(u.name)}"></label>
    <label>Phone number<input id="cPhone" type="tel" maxlength="10" placeholder="10 digits"></label>
    <label>Address<input id="cAddress" placeholder="House no, street, area"></label>
    <label>City<input id="cCity"></label>
    <label>PIN code<input id="cPin" maxlength="6" placeholder="6 digits"></label>
    <label>Payment</label>
    <div class="pay">
      <label><input type="radio" name="pay" value="UPI" checked> UPI</label>
      <label><input type="radio" name="pay" value="Card"> Card</label>
      <label><input type="radio" name="pay" value="Cash on delivery"> Cash on delivery</label>
    </div>
    <p class="error" id="cErr" role="alert"></p>
    <button class="btn big" onclick="placeOrder()">Place order · ${money(t.total)}</button>`);
}

function placeOrder() {
  const v = id => $(id).value.trim();
  const error = !v("cName") ? "Enter your name."
    : !/^\d{10}$/.test(v("cPhone")) ? "Phone number must have 10 digits."
    : !v("cAddress") ? "Enter your address."
    : !v("cCity") ? "Enter your city."
    : !/^\d{6}$/.test(v("cPin")) ? "PIN code must have 6 digits." : "";
  if (error) { $("cErr").textContent = error; return; }

  const order = {
    id: "SM" + Date.now().toString().slice(-8),
    email: currentUser().email,
    date: new Date().toLocaleDateString("en-IN"),
    total: totals().total,
    pay: document.querySelector("input[name=pay]:checked").value,
    address: v("cAddress") + ", " + v("cCity") + " - " + v("cPin"),
    items: Object.keys(cart).map(id => ({ name: find(id).name, icon: find(id).icon, qty: cart[id] }))
  };
  const orders = load("orders", []);
  orders.unshift(order);
  save("orders", orders);

  cart = {}; coupon = ""; save("coupon", ""); saveCart();
  openModal(`<div class="pd"><div style="font-size:4rem">🎉</div><h2>Order placed!</h2>
    <p class="note">Your order ID is <b>${order.id}</b>. It will reach you in 3 to 5 days. You can see it under your account.</p>
    <button class="btn big" onclick="closeModal()">Continue shopping</button></div>`);
}

/* ---------- countdown timer in the banner (ends at midnight) ---------- */
function tick() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const s = Math.max(0, Math.floor((end - new Date()) / 1000));
  $("timer").textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, "0")).join(":");
}
setInterval(tick, 1000);

/* ---------- start ---------- */
tick();
renderChips();
showShop();
updateCounts();
updateUserBtn();
