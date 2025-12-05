const bcrypt = require('bcryptjs');

// Generate hash for password 'admin123'
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hashed password:', hash);
console.log('\nAdd this to your backend/.env file:');
console.log(`ADMIN_PASSWORD=${hash}`);
