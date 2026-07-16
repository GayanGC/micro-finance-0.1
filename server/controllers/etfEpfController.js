const ETFEPFRecord = require('../models/ETFEPFRecord');
const Employee = require('../models/Employee');
const User = require('../models/User');

// ─── GET /api/etfepf — list all ETF/EPF records (with filters) ────────────────
exports.getRecords = async (req, res) => {
  try {
    const { year, month, status, employeeId } = req.query;
    const filter = {};
    if (year)       filter.year = parseInt(year);
    if (month)      filter.month = parseInt(month);
    if (status)     filter.status = status;
    if (employeeId) filter.employee = employeeId;

    const records = await ETFEPFRecord.find(filter)
      .populate({ path: 'employee', populate: { path: 'userId', select: 'name phone' } })
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/etfepf/bulk — bulk generate records for all active employees ──
exports.bulkGenerate = async (req, res) => {
  try {
    const { year, month } = req.body;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Year and month are required' });
    }

    // Get all active employees
    const employees = await Employee.find({ status: 'active' });
    if (!employees.length) {
      return res.status(400).json({ success: false, message: 'No active employees found' });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (const emp of employees) {
      try {
        const existing = await ETFEPFRecord.findOne({ employee: emp._id, year, month });
        if (existing) {
          results.skipped++;
          continue;
        }

        await ETFEPFRecord.create({
          employee: emp._id,
          year,
          month,
          basicSalary: emp.salary || 0,
          createdBy: req.user._id,
        });
        results.created++;
      } catch (e) {
        results.errors.push({ employeeId: emp._id, error: e.message });
      }
    }

    res.status(201).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/etfepf — create single record ──────────────────────────────────
exports.createRecord = async (req, res) => {
  try {
    const { employeeId, year, month, basicSalary, remarks } = req.body;
    if (!employeeId || !year || !month || basicSalary == null) {
      return res.status(400).json({ success: false, message: 'employeeId, year, month, basicSalary required' });
    }

    const record = await ETFEPFRecord.create({
      employee: employeeId,
      year,
      month,
      basicSalary,
      remarks: remarks || '',
      createdBy: req.user._id,
    });

    const populated = await ETFEPFRecord.findById(record._id)
      .populate({ path: 'employee', populate: { path: 'userId', select: 'name phone' } });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Record already exists for this employee/month/year' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/etfepf/:id — update status / remarks ──────────────────────────
exports.updateRecord = async (req, res) => {
  try {
    const { status, remarks, paidDate, submittedDate, basicSalary } = req.body;
    const record = await ETFEPFRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    if (status !== undefined)        record.status = status;
    if (remarks !== undefined)       record.remarks = remarks;
    if (paidDate !== undefined)      record.paidDate = paidDate;
    if (submittedDate !== undefined) record.submittedDate = submittedDate;
    if (basicSalary !== undefined)   record.basicSalary = basicSalary; // triggers pre-save recalc

    await record.save();
    const updated = await ETFEPFRecord.findById(record._id)
      .populate({ path: 'employee', populate: { path: 'userId', select: 'name phone' } });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/etfepf/:id ───────────────────────────────────────────────────
exports.deleteRecord = async (req, res) => {
  try {
    const record = await ETFEPFRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/etfepf/summary — monthly summary totals ────────────────────────
exports.getSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    const filter = {};
    if (year)  filter.year = parseInt(year);
    if (month) filter.month = parseInt(month);

    const agg = await ETFEPFRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          totalBasicSalary: { $sum: '$basicSalary' },
          totalEPFEmployee: { $sum: '$epfEmployee' },
          totalEPFEmployer: { $sum: '$epfEmployer' },
          totalEPF: { $sum: '$epfTotal' },
          totalETF: { $sum: '$etfEmployer' },
          totalContribution: { $sum: { $add: ['$epfTotal', '$etfEmployer'] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          paidCount:    { $sum: { $cond: [{ $eq: ['$status', 'paid']    }, 1, 0] } },
        },
      },
    ]);

    res.json({ success: true, data: agg[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
