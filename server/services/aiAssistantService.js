import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Tractor from '../models/Tractor.js';
import RiderEarning from '../models/RiderEarning.js';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `
You are the Telugu AI assistant for Samba Tractors.

Speak ONLY Telugu to the customer. The user may speak natural Telugu, Telugu-English mixed speech, or English words inside Telugu. Understand the intent naturally.

You are a WEBSITE AGENT, not just a question-answer chatbot.

You can help the authenticated user with:
- tractor service information
- their own bookings
- their own booking status
- their own payment status
- their own rider/tractor information
- rider earnings when the user is a rider
- admin dashboard information when the user is an admin
- opening the correct website page
- preparing booking or cancellation actions

SECURITY:
- Never reveal passwords, JWT secrets, API keys, MongoDB credentials, VAPID private keys, environment variables, or another user's private information.
- Never invent a booking, payment, rider, tractor, price, or availability.
- Only use information supplied in the user context.
- Do not execute financial transactions or payment verification by yourself.
- For important write operations, require confirmation.

AVAILABLE ACTIONS:
NONE
OPEN_BOOKING
OPEN_FARMER_DASHBOARD
OPEN_RIDER_DASHBOARD
OPEN_ADMIN_DASHBOARD
GET_MY_BOOKINGS
GET_BOOKING_STATUS
GET_MY_PAYMENTS
GET_MY_PROFILE
GET_SERVICES
GET_RIDER_EARNINGS
GET_RIDER_DETAILS
GET_TRACTOR_DETAILS
ASSIGN_RIDER_AND_TRACTOR
VERIFY_PAYMENT
CREATE_BOOKING
CANCEL_BOOKING
OPEN_PAYMENT_PAGE

BOOKING RULES:
- For CREATE_BOOKING, parameters should contain serviceId, quantity, bookingDate, timeSlot, paymentMethod and farmLocation when known.
- timeSlot must be one of MORNING, AFTERNOON, EVENING, NIGHT.
- paymentMethod must be ONLINE or OFFLINE.
- If important booking information is missing, ask for it instead of guessing.
- A voice booking must require confirmation before final creation.
- Online payment cannot be completed merely from voice. Direct the user to the payment page when payment proof/transaction details are required.
- CANCEL_BOOKING must require confirmation.

Return ONLY valid JSON:

{
  "reply": "Telugu response",
  "action": "ONE_ACTION_FROM_THE_LIST",
  "requiresConfirmation": false,
  "parameters": {}
}
`;

const safeBooking = (booking) => ({
  id: booking._id,
  bookingId: booking.bookingId,
  service:
    booking.serviceSnapshot?.name?.te ||
    booking.serviceSnapshot?.name?.en ||
    '',
  quantity: booking.quantity,
  unit: booking.unit,
  totalAmount: booking.totalAmount,
  bookingDate: booking.bookingDate,
  timeSlot: booking.timeSlot,
  status: booking.status,
  paymentMethod: booking.paymentMethod,
  paymentStatus: booking.paymentStatus,

  rider: booking.rider
    ? {
        name: booking.rider.name,
        phone: booking.rider.phone
      }
    : null,

  tractor: booking.tractor
    ? {
        name: booking.tractor.name,
        registrationNumber:
          booking.tractor.registrationNumber
      }
    : null,

  farmLocation: booking.farmLocation
    ? {
        address: booking.farmLocation.address,
        village: booking.farmLocation.village,
        landmark: booking.farmLocation.landmark
      }
    : null
});

const buildUserContext = async (user) => {
  const context = {
    user: {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      village: user.village || '',
      address: user.address || ''
    }
  };

  const services = await Service.find({
    isActive: true
  })
    .select(
      '_id code name category unit price description'
    )
    .sort({
      displayOrder: 1,
      createdAt: 1
    })
    .lean();

  context.services = services.map((service) => ({
    id: service._id.toString(),
    code: service.code,
    name: service.name,
    category: service.category,
    unit: service.unit,
    price: service.price,
    description: service.description
  }));

  if (user.role === 'farmer') {
    const bookings = await Booking.find({
      farmer: user._id
    })
      .populate('rider', 'name phone')
      .populate(
        'tractor',
        'name registrationNumber hp'
      )
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const payments = await Payment.find({
      farmer: user._id
    })
      .select(
        'bookingId amount paymentMethod transactionId status createdAt verifiedAt rejectionReason'
      )
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    context.bookings =
      bookings.map(safeBooking);

    context.payments = payments;
  }

  if (
    user.role === 'rider' ||
    user.role === 'admin'
  ) {
    const riderBookings =
      await Booking.find({
        rider: user._id
      })
        .populate('farmer', 'name phone')
        .populate(
          'tractor',
          'name registrationNumber hp'
        )
        .sort({ bookingDate: -1 })
        .limit(30)
        .lean();

    context.riderBookings =
      riderBookings.map((booking) => ({
        ...safeBooking(booking),

        farmer: booking.farmer
          ? {
              name: booking.farmer.name,
              phone: booking.farmer.phone
            }
          : null
      }));

    const earnings =
      await RiderEarning.find({
        rider: user._id
      })
        .select(
          'bookingId earningDate mode bookingAmount earningAmount description createdAt'
        )
        .sort({
          earningDate: -1,
          createdAt: -1
        })
        .limit(100)
        .lean();

    context.riderEarnings = earnings;
  }

  if (user.role === 'admin') {
    const [
      totalBookings,
      pendingBookings,
      activeRiders,
      tractors,
      riders,
      bookings,
      payments
    ] = await Promise.all([
      Booking.countDocuments(),

      Booking.countDocuments({
        status: {
          $in: [
            'PENDING',
            'PAYMENT_PENDING',
            'CONFIRMED'
          ]
        }
      }),

      User.countDocuments({
        role: 'rider',
        isActive: true
      }),

      Tractor.find({})
        .select(
          'name registrationNumber hp type status currentRider'
        )
        .lean(),

      User.find({
        role: 'rider',
        isActive: true
      })
        .select(
          'name phone village isAvailable riderEarningMode riderEarningValue assignedTractor'
        )
        .lean(),

      Booking.find({})
        .populate('rider', 'name phone')
        .populate(
          'tractor',
          'name registrationNumber'
        )
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),

      Payment.find({
        status: {
          $in: [
            'PENDING',
            'VERIFIED',
            'REJECTED',
            'COMPLETED'
          ]
        }
      })
        .populate(
          'farmer',
          'name phone'
        )
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    ]);

    context.admin = {
      totalBookings,
      pendingBookings,
      activeRiders,
      riders,
      tractors,

      bookings:
        bookings.map(safeBooking),

      payments:
        payments.map((payment) => ({
          id: payment._id,
          bookingId: payment.bookingId,
          amount: payment.amount,
          paymentMethod:
            payment.paymentMethod,
          transactionId:
            payment.transactionId,
          status: payment.status,

          farmer: payment.farmer
            ? {
                name: payment.farmer.name,
                phone: payment.farmer.phone
              }
            : null,

          createdAt:
            payment.createdAt
        }))
    };
  }

  return context;
};

const extractJson = (text) => {
  if (!text) {
    throw new Error(
      'AI returned an empty response'
    );
  }

  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start =
      cleaned.indexOf('{');

    const end =
      cleaned.lastIndexOf('}');

    if (
      start >= 0 &&
      end > start
    ) {
      return JSON.parse(
        cleaned.slice(start, end + 1)
      );
    }

    throw new Error(
      'AI returned invalid JSON'
    );
  }
};

export const askAI = async ({
  user,
  message,
  conversation = []
}) => {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server'
    );
  }

  const context =
    await buildUserContext(user);

  const contents = [
    ...conversation
      .slice(-8)
      .map((item) => ({
        role:
          item.role === 'assistant'
            ? 'model'
            : 'user',

        parts: [
          {
            text:
              String(
                item.content || ''
              )
          }
        ]
      })),

    {
      role: 'user',

      parts: [
        {
          text:
            `USER SAFE CONTEXT:\n${JSON.stringify(
              context
            )}\n\nCURRENT USER MESSAGE:\n${message}`
        }
      ]
    }
  ];

  const response =
    await fetch(
      `${GEMINI_API_URL}?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  SYSTEM_PROMPT
              }
            ]
          },

          contents,

          generationConfig: {
            temperature: 0.15,
            responseMimeType:
              'application/json'
          }
        })
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      'Gemini API error:',
      data
    );

    throw new Error(
      data?.error?.message ||
        'AI assistant request failed'
    );
  }

  const text =
    data?.candidates?.[0]
      ?.content?.parts
      ?.map(
        (part) =>
          part.text || ''
      )
      .join('')
      .trim();

  const result =
    extractJson(text);

  return {
    reply:
      typeof result.reply ===
      'string'
        ? result.reply
        : 'క్షమించండి, మీ అభ్యర్థనను అర్థం చేసుకోలేకపోయాను.',

    action:
      typeof result.action ===
      'string'
        ? result.action
        : 'NONE',

    requiresConfirmation:
      Boolean(
        result.requiresConfirmation
      ),

    parameters:
      result.parameters &&
      typeof result.parameters ===
        'object'
        ? result.parameters
        : {}
  };
};
