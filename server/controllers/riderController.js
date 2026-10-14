import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getIO } from '../config/socket.js';
import RiderEarning from '../models/RiderEarning.js';

// @desc    Get bookings assigned to logged-in rider
// @route   GET /api/rider/bookings
// @access  Private (Rider)
export const getRiderBookings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allRiderBookings = await Booking.find({ rider: req.user._id })
      .populate('farmer', 'name phone email village address')
      .populate('tractor', 'name registrationNumber hp')
      .sort({ bookingDate: 1, createdAt: -1 });

    const todaysBookings = allRiderBookings.filter(b => {
      const d = new Date(b.bookingDate);
      return d >= today && d < tomorrow && !['COMPLETED', 'CLOSED', 'CANCELLED'].includes(b.status);
    });

    const upcomingBookings = allRiderBookings.filter(b => {
      const d = new Date(b.bookingDate);
      return d >= tomorrow && !['COMPLETED', 'CLOSED', 'CANCELLED'].includes(b.status);
    });

    const completedBookings = allRiderBookings.filter(b => {
      return ['SERVICE_COMPLETED', 'PAYMENT_COMPLETED', 'CLOSED'].includes(b.status);
    });
       res.json({
      success: true,
      data: {
        todays: todaysBookings,
        upcoming: upcomingBookings,
        completed: completedBookings,
        all: allRiderBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// RIDER EARNINGS DASHBOARD
// =====================================================

// @desc    Get rider earnings dashboard
// @route   GET /api/rider/earnings
// @access  Private (Rider)
export const getRiderEarnings = async (req, res) => {
  try {
    const riderId = req.user._id;

    const earnings = await RiderEarning.find({
      rider: riderId
    })
      .populate({
        path: 'booking',
        select:
          'bookingId farmerName farmerPhone totalAmount serviceSnapshot quantity unit bookingDate timeSlot farmLocation status'
      })
      .sort({
        earningDate: -1,
        createdAt: -1
      });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(
      weekStart.getDate() - weekStart.getDay()
    );

    const monthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const todayEarnings = earnings.filter(
      e =>
        e.earningDate >= today &&
        e.earningDate < tomorrow
    );

    const weeklyEarnings = earnings.filter(
      e => e.earningDate >= weekStart
    );

    const monthlyEarnings = earnings.filter(
      e => e.earningDate >= monthStart
    );

    const sum = list =>
      list.reduce(
        (total, item) =>
          total + Number(item.earningAmount || 0),
        0
      );

    res.json({
      success: true,

      data: {
        today: {
          amount: sum(todayEarnings),
          rides: todayEarnings.length
        },

        weekly: {
          amount: sum(weeklyEarnings),
          rides: weeklyEarnings.length
        },

        monthly: {
          amount: sum(monthlyEarnings),
          rides: monthlyEarnings.length
        },

        total: {
          amount: sum(earnings),
          rides: earnings.length
        },

        earnings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const getRiderEarningsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const earnings = await RiderEarning.find({
      rider: req.user._id,
      earningDate: {
        $gte: start,
        $lt: end
      }
    })
      .populate({
        path: 'booking',
        select:
          'bookingId farmerName farmerPhone totalAmount serviceSnapshot quantity unit bookingDate timeSlot farmLocation status'
      })
      .sort({ createdAt: -1 });

    const total = earnings.reduce(
      (sum, item) => sum + Number(item.earningAmount || 0),
      0
    );

    res.json({
      success: true,
      data: {
        date,
        total,
        rides: earnings.length,
        earnings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking workflow status by Rider
// @route   PATCH /api/rider/bookings/:id/status
// @access  Private (Rider)
export const updateBookingStatusByRider = async (req, res) => {
   


// @desc    Update booking workflow status by Rider
// @route   PATCH /api/rider/bookings/:id/status
// @access  Private (Rider)
export const updateBookingStatusByRider = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowedStatuses = [
      'RIDER_ON_THE_WAY',
      'ARRIVED',
      'SERVICE_STARTED',
      'SERVICE_COMPLETED'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition for rider. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      rider: req.user._id
    }).populate('farmer', 'name phone email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not assigned to you' });
    }

    booking.status = status;
    booking.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status changed to ${status} by Rider ${req.user.name}`
    });

    if (status === 'SERVICE_COMPLETED') {
  booking.serviceCompletedAt = new Date();

  // If payment was already verified online, mark payment completed
  if (
    booking.paymentMethod === 'ONLINE' &&
    booking.paymentStatus === 'VERIFIED'
  ) {
    booking.paymentStatus = 'COMPLETED';
    booking.status = 'PAYMENT_COMPLETED';
  }
}

await booking.save();

// Create Rider Earning
if (status === 'SERVICE_COMPLETED') {
  const rider = await User.findById(req.user._id);

  if (rider) {
    const RiderEarning = (await import('../models/RiderEarning.js')).default;

    const earningDate = new Date(booking.serviceCompletedAt || new Date());
    earningDate.setHours(0, 0, 0, 0);

    let earningAmount = 0;
    let description = '';

    if (rider.riderEarningMode === 'PER_RIDE_FIXED') {
      earningAmount = Number(rider.riderEarningValue || 0);

      description = `Fixed earning for ride ${booking.bookingId}`;
    }

    if (rider.riderEarningMode === 'PERCENTAGE') {
      earningAmount =
        (Number(booking.totalAmount || 0) *
          Number(rider.riderEarningValue || 0)) /
        100;

      description = `${rider.riderEarningValue}% share from booking ${booking.bookingId}`;
    }

    if (rider.riderEarningMode === 'DAILY_FIXED') {
      const existingDailyEarning = await RiderEarning.findOne({
        rider: rider._id,
        earningDate,
        mode: 'DAILY_FIXED'
      });

      if (!existingDailyEarning) {
        earningAmount = Number(rider.riderEarningValue || 0);

        description = `Daily fixed earning for ${earningDate.toLocaleDateString()}`;
      }
    }

    if (earningAmount > 0) {
      await RiderEarning.create({
        rider: rider._id,
        booking: booking._id,
        bookingId: booking.bookingId,
        earningDate,
        mode: rider.riderEarningMode,
        bookingAmount: booking.totalAmount,
        earningAmount,
        percentage:
          rider.riderEarningMode === 'PERCENTAGE'
            ? rider.riderEarningValue
            : 0,
        description
      });
    }
  }
}

    // Multilingual Notification for Farmer
    const statusMessages = {
      RIDER_ON_THE_WAY: {
        title: { te: 'డ్రైవర్ బయలుదేరాడు 🚜', en: 'Rider On The Way 🚜', hi: 'ड्राइवर रास्ते में है 🚜' },
        message: {
          te: `మీ ట్రాక్టర్ డ్రైవర్ ${req.user.name} మీ పొలానికి బయలుదేరాడు.`,
          en: `Your tractor rider ${req.user.name} is on the way to your farm.`,
          hi: `आपका ट्रैक्टर ड्राइवर ${req.user.name} आपके खेत के लिए निकल चुका है।`
        }
      },
      ARRIVED: {
        title: { te: 'ట్రాక్టర్ పొలానికి చేరుకుంది 📍', en: 'Tractor Arrived at Farm 📍', hi: 'ट्रैक्टर खेत पर पहुंच गया 📍' },
        message: {
          te: `ట్రాక్టర్ మీ పొలం వద్దకు చేరుకుంది. దయచేసి డ్రైవర్‌ను కలవండి.`,
          en: `Tractor has arrived at your farm gate/landmark. Please guide the rider.`,
          hi: `ट्रैक्टर आपके खेत के लैंडमार्क पर पहुंच गया है। कृपया ड्राइवर से मिलें।`
        }
      },
      SERVICE_STARTED: {
        title: { te: 'పని ప్రారంభమైంది ⚙️', en: 'Farming Service Started ⚙️', hi: 'खेत का कार्य शुरू हुआ ⚙️' },
        message: {
          te: `మీ ${booking.serviceSnapshot.name.te} పని ప్రారంభమైంది.`,
          en: `Service for ${booking.serviceSnapshot.name.en} has started.`,
          hi: `आपकी ${booking.serviceSnapshot.name.hi} का कार्य शुरू हो गया है।`
        }
      },
      SERVICE_COMPLETED: {
        title: { te: 'పని పూర్తయింది! 🌾', en: 'Service Completed! 🌾', hi: 'कार्य सफलतापूर्वक पूर्ण! 🌾' },
        message: {
          te: `మీ ${booking.serviceSnapshot.name.te} పని పూర్తయింది. దయచేసి రేటింగ్ ఇవ్వండి!`,
          en: `Tractor service successfully completed. Please leave your rating and feedback!`,
          hi: `ट्रैक्टर सेवा सफलतापूर्वक पूर्ण हो गई। कृपया अपनी रेटिंग दें!`
        }
      }
    };

    const msgConfig = statusMessages[status];
    if (msgConfig) {
      await Notification.create({
        recipient: booking.farmer._id,
        booking: booking._id,
        bookingId: booking.bookingId,
        type: status,
        title: msgConfig.title,
        message: msgConfig.message
      });
    }

    // Keep admins informed about each rider workflow transition too.
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    await Promise.all(admins.map((admin) => Notification.create({
      recipient: admin._id, booking: booking._id, bookingId: booking.bookingId, type: status,
      title: {
        te: `బుకింగ్ స్థితి నవీకరణ: ${status}`,
        en: `Rider update: ${status.replaceAll('_', ' ')}`,
        hi: `राइडर अपडेट: ${status.replaceAll('_', ' ')}`
      },
      message: {
        te: `బుకింగ్ ${booking.bookingId} స్థితిని రైడర్ ${req.user.name} నవీకరించారు.`,
        en: `Rider ${req.user.name} updated booking ${booking.bookingId} to ${status.replaceAll('_', ' ')}.`,
        hi: `राइडर ${req.user.name} ने बुकिंग ${booking.bookingId} की स्थिति अपडेट की।`
      }
    })));

    // Socket.IO real time emit
    try {
      const io = getIO();
      if (io) {
        io.to(`booking_${booking._id}`).emit('booking_status_updated', {
          bookingId: booking._id,
          status: booking.status,
          updatedBy: req.user.name
        });
      }
    } catch (e) {
      console.warn('Socket emit error:', e.message);
    }

    res.json({
      success: true,
      message: `Booking updated to ${status}`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
