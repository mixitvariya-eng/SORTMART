/* Sortmart product data. To add a product, copy one row and change the values. */

// Category name -> emoji and background colour
const cats = {
  Electronics: { icon: "💻", bg: "#e4e9ff" },
  Fashion:     { icon: "👟", bg: "#ffe6ee" },
  Home:        { icon: "🛋️", bg: "#fff1d6" },
  Beauty:      { icon: "💄", bg: "#f3e6ff" },
  Sports:      { icon: "⚽", bg: "#dcf7e8" },
  Books:       { icon: "📚", bg: "#e0f4fb" }
};

// Coupon codes: "pct" = percent off, "flat" = rupees off
const coupons = {
  SAVE10:     { type: "pct",  value: 10,  text: "10% off" },
  WELCOME100: { type: "flat", value: 100, text: "₹100 off" }
};

// id, name, category, price, old price (MRP), rating, reviews, emoji, description
const rows = [
  [1, "Smartphone X12", "Electronics", 14999, 18999, 4.4, 1520, "📱", "6.5-inch AMOLED screen, 128 GB storage and a 5000 mAh battery."],
  [2, "Wireless Earbuds", "Electronics", 1499, 2999, 4.2, 3410, "🎧", "Clear sound, touch controls and 24 hours of battery with the case."],
  [3, "Smart Watch", "Electronics", 2499, 4999, 4.1, 2210, "⌚", "Tracks steps, sleep and heart rate. Water resistant."],
  [4, "Laptop Air 15", "Electronics", 42999, 52999, 4.5, 860, "💻", "Light 15-inch laptop with 16 GB RAM and a 512 GB SSD."],
  [5, "Bluetooth Speaker", "Electronics", 1799, 2999, 4.3, 1980, "🔊", "Loud, deep bass and 12 hours of playtime."],
  [6, "Running Sneakers", "Fashion", 1999, 3499, 4.3, 2750, "👟", "Soft cushioned sole that is light on your feet."],
  [7, "Denim Jacket", "Fashion", 1799, 2999, 4.0, 640, "🧥", "Classic blue denim jacket with a comfortable fit."],
  [8, "Travel Backpack", "Fashion", 899, 1599, 4.4, 3120, "🎒", "30 litre bag with a laptop pocket and rain cover."],
  [9, "Sunglasses", "Fashion", 699, 1499, 3.9, 1240, "🕶️", "UV400 protection with a lightweight frame."],
  [10, "Cotton T-Shirt", "Fashion", 399, 799, 4.2, 5200, "👕", "Soft 100% cotton, available in many sizes."],
  [11, "Table Lamp", "Home", 799, 1299, 4.1, 910, "💡", "Warm light with three brightness levels."],
  [12, "Coffee Maker", "Home", 2299, 3499, 4.4, 1340, "☕", "Makes up to 4 cups in 5 minutes."],
  [13, "Cushion Set (4)", "Home", 599, 999, 4.0, 770, "🛋️", "Soft covers that are easy to wash."],
  [14, "Wall Clock", "Home", 499, 899, 4.2, 530, "🕰️", "Silent clock that suits any room."],
  [15, "Air Fryer", "Home", 3999, 6499, 4.6, 2890, "🍟", "Fry with little or no oil. 4 litre basket."],
  [16, "Lipstick Trio", "Beauty", 599, 999, 4.3, 1760, "💄", "Three long-lasting shades in a gift box."],
  [17, "Face Serum", "Beauty", 449, 799, 4.2, 2330, "🧴", "Vitamin C serum for a fresh, even look."],
  [18, "Perfume", "Beauty", 1299, 2199, 4.5, 1090, "🌸", "Light floral scent that lasts all day."],
  [19, "Hair Dryer", "Beauty", 1199, 1999, 4.1, 1450, "💇", "1800 W dryer with cool and hot settings."],
  [20, "Sunscreen SPF 50", "Beauty", 349, 549, 4.4, 4100, "☀️", "Non-greasy lotion for daily use."],
  [21, "Football", "Sports", 799, 1299, 4.2, 980, "⚽", "Size 5 match ball with strong stitching."],
  [22, "Yoga Mat", "Sports", 699, 1299, 4.4, 2640, "🧘", "6 mm thick, non-slip and easy to carry."],
  [23, "Dumbbell Set", "Sports", 1499, 2499, 4.3, 1180, "🏋️", "Pair of adjustable dumbbells, 2 to 10 kg."],
  [24, "Badminton Racket", "Sports", 999, 1699, 4.1, 1560, "🏸", "Light graphite racket with a cover."],
  [25, "Steel Water Bottle", "Sports", 399, 699, 4.5, 6020, "🥤", "Keeps drinks cold for 24 hours."],
  [26, "Algorithms Handbook", "Books", 549, 799, 4.7, 1870, "📘", "Sorting, searching and graphs explained step by step."],
  [27, "Learn Python in 30 Days", "Books", 349, 599, 4.5, 3340, "🐍", "A beginner-friendly book with daily practice tasks."],
  [28, "Mystery at Midnight", "Books", 249, 399, 4.0, 720, "🔍", "A fast-paced detective novel."],
  [29, "World Atlas", "Books", 599, 899, 4.4, 410, "🗺️", "Colourful maps with facts about every country."],
  [30, "Kids Story Collection", "Books", 299, 499, 4.6, 1290, "🧸", "50 short bedtime stories with pictures."]
];

// Turn each row into an object so the code is easier to read
const products = rows.map(r => ({
  id: r[0], name: r[1], cat: r[2], price: r[3], mrp: r[4],
  rating: r[5], sold: r[6], icon: r[7], desc: r[8]
}));
