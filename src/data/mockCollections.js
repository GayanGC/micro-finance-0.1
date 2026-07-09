// Mock Collections Data

// Today's due collections (for Daily Collection screen)
export const initialTodayCollections = [
  { id: 'COL001', loanId: 'L001', customerName: 'Kamal Perera',    area: 'Colombo 7', amountDue: 1500, paid: false },
  { id: 'COL002', loanId: 'L002', customerName: 'Nimali Silva',    area: 'Nugegoda',  amountDue: 2800, paid: false },
  { id: 'COL003', loanId: 'L006', customerName: 'Dilhani Rathnayake', area: 'Matara',  amountDue: 1200, paid: false },
  { id: 'COL004', loanId: 'L007', customerName: 'Priya Marasinghe', area: 'Colombo 3', amountDue: 1800, paid: true  },
  { id: 'COL005', loanId: 'L009', customerName: 'Sandya Liyanage', area: 'Negombo',   amountDue: 2250, paid: true  },
  { id: 'COL006', loanId: 'L010', customerName: 'Lasantha Wickrama', area: 'Moratuwa', amountDue: 1000, paid: false },
];

// Monthly collections trend (last 6 months) for bar chart
export const monthlyCollections = [
  { month: 'Feb', amount: 285000 },
  { month: 'Mar', amount: 312000 },
  { month: 'Apr', amount: 298000 },
  { month: 'May', amount: 354000 },
  { month: 'Jun', amount: 321000 },
  { month: 'Jul', amount: 187000 }, // current month, partial
];

// Loan type breakdown for donut chart
export const loanTypeBreakdown = [
  { name: 'Insurance', value: 42, count: 5 },
  { name: 'Daily',     value: 35, count: 4 },
  { name: 'Wage',      value: 23, count: 3 },
];
