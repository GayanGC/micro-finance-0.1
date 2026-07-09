const cron = require('node-cron');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const { formatRs } = require('../utils/formatCurrency');

/**
 * Daily cron job — runs at midnight every day.
 *
 * Tasks:
 * 1. Flag all loans past their dueDate as "overdue" (if not already paid)
 * 2. Create "due_today" notifications for loans due today
 * 3. Create "overdue" notifications for newly overdue loans
 */
const startCronJobs = () => {
  // Schedule: every day at 00:01 AM
  cron.schedule('1 0 * * *', async () => {
    console.log(`🕐  [CRON] Running daily loan check — ${new Date().toISOString()}`);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // ── 1. Flag overdue loans ──────────────────────────────────────────
      const overdueResult = await Loan.updateMany(
        {
          status: { $in: ['active', 'pending'] },
          dueDate: { $lt: today }, // past due, still not paid
          balance: { $gt: 0 },
        },
        { $set: { status: 'overdue' } }
      );

      if (overdueResult.modifiedCount > 0) {
        console.log(`  ⚠️  Marked ${overdueResult.modifiedCount} loan(s) as overdue`);
      }

      // ── 2. Create overdue notifications ───────────────────────────────
      const overdueLoans = await Loan.find({
        status: 'overdue',
        dueDate: { $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000), $lt: today },
      }).populate('customer', 'name');

      for (const loan of overdueLoans) {
        // Avoid duplicate notifications (check if one was already created today)
        const alreadyNotified = await Notification.findOne({
          relatedLoan: loan._id,
          type: 'overdue',
          createdAt: { $gte: today },
        });

        if (!alreadyNotified) {
          await Notification.create({
            type: 'overdue',
            message: `Loan overdue for ${loan.customer?.name || 'customer'}. Balance: ${formatRs(loan.balance)}`,
            relatedLoan: loan._id,
          });
        }
      }

      // ── 3. Create due_today notifications ─────────────────────────────
      const dueTodayLoans = await Loan.find({
        status: { $in: ['active', 'pending'] },
        dueDate: { $gte: today, $lt: tomorrow },
      }).populate('customer', 'name');

      for (const loan of dueTodayLoans) {
        const alreadyNotified = await Notification.findOne({
          relatedLoan: loan._id,
          type: 'due_today',
          createdAt: { $gte: today },
        });

        if (!alreadyNotified) {
          await Notification.create({
            type: 'due_today',
            message: `Loan due today for ${loan.customer?.name || 'customer'}. Balance: ${formatRs(loan.balance)}`,
            relatedLoan: loan._id,
          });
        }
      }

      console.log(`  ✅  [CRON] Done — ${dueTodayLoans.length} due-today, ${overdueLoans.length} overdue notifications`);
    } catch (error) {
      console.error('  ❌  [CRON] Error during daily loan check:', error.message);
    }
  });

  console.log('⏰  Cron job scheduled: daily loan status check at 00:01');
};

module.exports = startCronJobs;
