/**
 * Database Seeder — populates MongoDB with sample data for development/testing.
 *
 * Usage:
 *   node utils/seeder.js          → import sample data
 *   node utils/seeder.js --clear  → clear all collections
 *
 * IMPORTANT: Never run this against production.
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User     = require('../models/User');
const Customer = require('../models/Customer');
const Loan     = require('../models/Loan');
const Payment  = require('../models/Payment');
const Notification = require('../models/Notification');

const connectDB = require('../config/db');

// ─── Sample Data ──────────────────────────────────────────────────────────

const sampleUsers = [
  { name: 'Admin User',       phone: '0771234567', pin: '123456', role: 'admin', branch: 'Head Office' },
  { name: 'Amal Kumara',      phone: '0712345678', pin: '1234',   role: 'agent', branch: 'Colombo' },
  { name: 'Nimal Perera',     phone: '0777654321', pin: '4321',   role: 'agent', branch: 'Kandy' },
];

const sampleCustomers = [
  { name: 'Kamal Perera',           phone: '071-234-5678', nic: '880123456V', address: '45/A, Rosmead Place, Colombo 07', area: 'Colombo 7' },
  { name: 'Nimali Silva',           phone: '077-345-6789', nic: '905234567V', address: '12, Havelock Town, Nugegoda',      area: 'Nugegoda' },
  { name: 'Suresh Jayawardena',     phone: '076-456-7890', nic: '780987654V', address: '23, Peradeniya Rd, Kandy',         area: 'Kandy' },
  { name: 'Chamari Wickramasinghe', phone: '075-567-8901', nic: '925678901V', address: '8/B, Galle Rd, Dehiwala',          area: 'Dehiwala' },
  { name: 'Ranjith Gunasekara',     phone: '070-678-9012', nic: '860345678V', address: '56, Station Rd, Gampaha',          area: 'Gampaha' },
  { name: 'Dilhani Rathnayake',     phone: '078-789-0123', nic: '935789012V', address: '34, Main St, Matara',              area: 'Matara' },
  { name: 'Priya Marasinghe',       phone: '072-890-1234', nic: '910456789V', address: '101, Galle Face Terrace, Colombo', area: 'Colombo 3' },
  { name: 'Saman Herath',           phone: '071-901-2345', nic: '830567890V', address: '78, Kandy Rd, Kurunegala',         area: 'Kurunegala' },
  { name: 'Sandya Liyanage',        phone: '077-012-3456', nic: '955678901V', address: '22, Lewis Place, Negombo',         area: 'Negombo' },
  { name: 'Lasantha Wickrama',      phone: '076-123-4567', nic: '875890123V', address: '15, Rawathawatta Rd, Moratuwa',    area: 'Moratuwa' },
];

const importData = async () => {
  await connectDB();
  try {
    // Clear existing
    await User.deleteMany();
    await Customer.deleteMany();
    await Loan.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();

    // Create users (pre-hash handled by User model pre-save hook)
    const createdUsers = await User.create(sampleUsers);
    const adminUser  = createdUsers[0];
    const agentUser  = createdUsers[1];

    console.log(`✅  ${createdUsers.length} users seeded`);

    // Create customers
    const customersWithCreator = sampleCustomers.map(c => ({ ...c, createdBy: agentUser._id }));
    const createdCustomers = await Customer.create(customersWithCreator);
    console.log(`✅  ${createdCustomers.length} customers seeded`);

    // Create loans
    const now = new Date();
    const future30 = new Date(now.getTime() + 30 * 86400000);
    const past7    = new Date(now.getTime() - 7 * 86400000);

    const loanDefs = [
      { customer: createdCustomers[0]._id, type: 'Daily',     amount: 50000,  balance: 32500,  interestRate: 12, status: 'active',  dueDate: future30,    guarantor: 'Sunil Bandara' },
      { customer: createdCustomers[1]._id, type: 'Insurance', amount: 120000, balance: 89000,  interestRate: 10, status: 'overdue', dueDate: past7,       guarantor: 'Pradeep Fernando' },
      { customer: createdCustomers[2]._id, type: 'Wage',      amount: 75000,  balance: 0,      interestRate: 8,  status: 'paid',    dueDate: past7,       guarantor: 'Roshan Dissanayake' },
      { customer: createdCustomers[3]._id, type: 'Daily',     amount: 30000,  balance: 30000,  interestRate: 12, status: 'pending', dueDate: future30,    guarantor: 'Tharanga Rajapaksha' },
      { customer: createdCustomers[4]._id, type: 'Insurance', amount: 200000, balance: 145000, interestRate: 10, status: 'active',  dueDate: future30,    guarantor: 'Lalith Kumara' },
      { customer: createdCustomers[5]._id, type: 'Wage',      amount: 60000,  balance: 22000,  interestRate: 8,  status: 'overdue', dueDate: past7,       guarantor: 'Udara Senanayake' },
      { customer: createdCustomers[6]._id, type: 'Daily',     amount: 45000,  balance: 18000,  interestRate: 12, status: 'active',  dueDate: future30,    guarantor: 'Nimal Weerasinghe' },
      { customer: createdCustomers[7]._id, type: 'Insurance', amount: 150000, balance: 0,      interestRate: 10, status: 'paid',    dueDate: past7,       guarantor: 'Asiri Pathirana' },
      { customer: createdCustomers[8]._id, type: 'Wage',      amount: 90000,  balance: 67500,  interestRate: 8,  status: 'active',  dueDate: future30,    guarantor: 'Chathura Dias' },
      { customer: createdCustomers[9]._id, type: 'Daily',     amount: 25000,  balance: 25000,  interestRate: 12, status: 'overdue', dueDate: past7,       guarantor: 'Jeewantha Peiris' },
    ];

    const createdLoans = await Loan.insertMany(
      loanDefs.map(l => ({ ...l, createdBy: agentUser._id }))
    );
    console.log(`✅  ${createdLoans.length} loans seeded`);

    // Create sample notifications
    await Notification.create([
      { type: 'overdue',   message: 'Loan overdue for Nimali Silva. Balance: Rs. 89,000',    relatedLoan: createdLoans[1]._id },
      { type: 'overdue',   message: 'Loan overdue for Dilhani Rathnayake. Balance: Rs. 22,000', relatedLoan: createdLoans[5]._id },
      { type: 'due_today', message: 'Loan due today for Kamal Perera. Balance: Rs. 32,500',  relatedLoan: createdLoans[0]._id },
      { type: 'system',    message: 'Welcome to MicroFinance Passbook Ledger v0.1' },
    ]);
    console.log(`✅  Notifications seeded`);

    console.log('\n🎉  Database seeded successfully!');
    console.log('\n📋  Login credentials:');
    sampleUsers.forEach(u => {
      console.log(`   ${u.role.toUpperCase().padEnd(6)} | Phone: ${u.phone} | PIN: ${u.pin}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('❌  Seeder error:', error);
    process.exit(1);
  }
};

const clearData = async () => {
  await connectDB();
  try {
    await User.deleteMany();
    await Customer.deleteMany();
    await Loan.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();
    console.log('🗑️   All data cleared');
    process.exit(0);
  } catch (error) {
    console.error('❌  Clear error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '--clear') {
  clearData();
} else {
  importData();
}
