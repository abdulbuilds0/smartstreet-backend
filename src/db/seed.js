require('dotenv').config();
const pool = require('./pool');

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding demo vendors...');
    const cats = await client.query('SELECT id, name FROM categories');
    const catMap = {};
    cats.rows.forEach(c => { catMap[c.name] = c.id; });

    const adminRes = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminRes.rows.length === 0) { console.error('No admin found!'); process.exit(1); }
    const adminId = adminRes.rows[0].id;

    const vendors = [
      { shop_name: 'Moradabadi Daal', category: 'Food', description: 'Garama garam mazedaar moong daal chaat, full on masala ke saath!', phone: '+919876543210', address: 'Shamsi Masjid Lane, Lajpat Nagar, Moradabad', lat: 28.825954, lng: 78.781256 },
      { shop_name: 'Delhi Chats', category: 'Food', description: 'Tea, coffee, snacks, pakoras and more. Fun for family and friends.', phone: '+919359709416', address: 'Behind Water Tanki, Lajpat Nagar, Moradabad', lat: 28.82600, lng: 78.78131 },
      { shop_name: 'Ravi Vegetables', category: 'Food', description: 'Fresh vegetables daily. Aalo, tamatar, onion, cucumber and more.', phone: '+919876543212', address: 'Eidgah Chauraha, Lajpat Nagar, Moradabad', lat: 28.826653, lng: 78.779871 },
      { shop_name: 'Jain Confectionery', category: 'Food', description: 'Bread, Butter, Milk, Eggs and many other household items.', phone: '+919876543213', address: '101, Lajpat Nagar, Moradabad', lat: 28.826560, lng: 78.779842 },
      { shop_name: 'Aslam Fruits', category: 'Food', description: 'Fresh fruits daily. Apples, bananas, mangoes and seasonal fruits.', phone: '+919876543214', address: 'Eidgah Road, Moradabad', lat: 28.826307, lng: 78.779354 },
      { shop_name: 'Ibrahim Cycle Works', category: 'Services', description: 'Cycle, Bike, Car, rickshaw puncture fix. Fast and reliable.', phone: '+919876543215', address: 'Galshaheed Chauraha, Moradabad', lat: 28.826304, lng: 78.784854 },
      { shop_name: 'Kishan Tailor', category: 'Services', description: 'Stitching and alterations for men and women. Latest trends.', phone: '+919876543216', address: '112H, Galshaheed Chauraha, Moradabad', lat: 28.829328, lng: 78.781057 },
      { shop_name: 'Suleman Brass Works', category: 'Handicrafts', description: 'Ancient brass casting craft passed down through generations.', phone: '+919876543217', address: '21, Lajpat Nagar Market, Moradabad', lat: 28.827819, lng: 78.785899 },
      { shop_name: "Razia's Zari Zardozi", category: 'Handicrafts', description: 'Exquisite handmade Zardozi and bridal wear. Pure artistry.', phone: '+919876543218', address: 'Bazaar Nasrullah Khan, Moradabad', lat: 28.828112, lng: 78.783456 },
      { shop_name: 'Ahmed Wood Carving', category: 'Handicrafts', description: 'Beautifully carved wooden screens, tables, and unique decor items.', phone: '+919876543219', address: 'Lajpat Nagar, near Eidgah, Moradabad', lat: 28.827500, lng: 78.780123 },
      { shop_name: 'Gupta Garments', category: 'Clothing', description: 'Affordable readymade clothes for the whole family.', phone: '+919876543221', address: 'Galshaheed Road, Moradabad', lat: 28.825800, lng: 78.784000 },
      { shop_name: "New Look Men's Wear", category: 'Clothing', description: 'Latest shirts, trousers, jeans and suits for men.', phone: '+919876543222', address: '105, Lajpat Nagar, Moradabad', lat: 28.828300, lng: 78.782500 },
      { shop_name: 'Raju Electrician', category: 'Services', description: 'Quick electrician for all home wiring, fan and light repairs.', phone: '+919876543223', address: 'Eidgah Chauraha, Moradabad', lat: 28.826111, lng: 78.779555 }
    ];

    let added = 0;
    for (const v of vendors) {
      const catId = catMap[v.category];
      if (!catId) { console.warn('Category not found:', v.category); continue; }
      await client.query(
        'INSERT INTO vendors (shop_name, category_id, description, phone, address, lat, lng, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [v.shop_name, catId, v.description, v.phone, v.address, v.lat, v.lng, adminId]
      );
      console.log('Added:', v.shop_name);
      added++;
    }
    console.log(`\nDone! ${added} vendors added.`);
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    client.release();
    process.exit();
  }
};
seed();
