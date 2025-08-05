#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Employee Monitoring System Backend Setup');
console.log('==========================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const configEnvPath = path.join(__dirname, 'config.env');

if (!fs.existsSync(envPath) && fs.existsSync(configEnvPath)) {
  console.log('📝 Creating .env file from config.env...');
  try {
    fs.copyFileSync(configEnvPath, envPath);
    console.log('✅ .env file created successfully');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    process.exit(1);
  }
} else if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else {
  console.error('❌ config.env file not found. Please create it first.');
  process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('\n🗄️  Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  console.log('⚠️  Make sure PostgreSQL is running and DATABASE_URL is configured');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Configure your PostgreSQL database');
console.log('2. Update DATABASE_URL in .env file');
console.log('3. Run: npm run db:push');
console.log('4. Run: npm run dev');
console.log('\n📚 For more information, see README.md'); 