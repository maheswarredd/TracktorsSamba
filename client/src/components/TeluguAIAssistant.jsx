import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  Bot,
  Check,
  Loader2,
  Mic,
  MicOff,
  Send,
  X
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

const TeluguAIAssistant = () => {
  const {
    user,
    isAuthenticated
  } = useAuth();

  const navigate =
    useNavigate();

  const recognitionRef =
    useRef(null);

  const messagesEndRef =
    useRef(null);

  const [open, setOpen] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [input, setInput] =
    useState('');

  const [pendingAction, setPendingAction] =
  useState(null);

const [bookingDraft, setBookingDraft] =
  useState({});

const [messages, setMessages] =
  useState([]);
  const browserSupportsVoice =
    useMemo(
      () => Boolean(SpeechRecognition),
      []
    );

  useEffect(() => {
    if (!isAuthenticated) return;

    setMessages([
      {
        role: 'assistant',
        content:
          'నమస్కారం! నేను Samba Tractors తెలుగు AI సహాయకుడిని. మీ బుకింగ్, స్టేటస్, పేమెంట్, రైడర్ లేదా ట్రాక్టర్ వివరాల గురించి మాట్లాడవచ్చు.'
      }
    ]);
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakTelugu = (text) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = 'te-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices =
      window.speechSynthesis.getVoices();

    const teluguVoice =
      voices.find((voice) =>
        voice.lang
          ?.toLowerCase()
          .startsWith('te')
      );

    if (teluguVoice) {
      utterance.voice =
        teluguVoice;
    }

    window.speechSynthesis.speak(
      utterance
    );
  };

  const executeAction = async (
  action,
  parameters = {}
) => {
  const mergedParameters =
    action === 'CREATE_BOOKING'
      ? {
          ...bookingDraft,
          ...parameters
        }
      : parameters;
    switch (action) {
      case 'OPEN_BOOKING':
        navigate('/book');
        return 'బుకింగ్ పేజీని తెరిచాను.';

      case 'OPEN_FARMER_DASHBOARD':
        navigate('/farmer-dashboard');
        return 'మీ రైతు డాష్‌బోర్డ్‌ను తెరిచాను.';

      case 'OPEN_RIDER_DASHBOARD':
        navigate('/rider-dashboard');
        return 'మీ రైడర్ డాష్‌బోర్డ్‌ను తెరిచాను.';

      case 'OPEN_ADMIN_DASHBOARD':
        navigate('/admin-dashboard');
        return 'అడ్మిన్ డాష్‌బోర్డ్‌ను తెరిచాను.';

      case 'OPEN_PAYMENT_PAGE':
        navigate('/farmer-dashboard');
        return 'మీ బుకింగ్ మరియు పేమెంట్ వివరాల పేజీని తెరిచాను.';

      case 'CREATE_BOOKING': {
        if (user?.role !== 'farmer') {
          throw new Error(
            'బుకింగ్ చేయడానికి రైతు ఖాతాతో లాగిన్ అవ్వాలి.'
          );
        }
         // Keep details collected in previous AI messages
  // and merge the latest AI response into them.
  const bookingParameters = {
    ...bookingDraft,
    ...parameters
  };


       const required = [
  'serviceId',
  'quantity',
  'bookingDate',
  'timeSlot',
  'paymentMethod'
];

const missing =
  required.filter(
    (key) => !parameters[key]
  );

if (missing.length) {
  throw new Error(
    'బుకింగ్‌కు అవసరమైన వివరాలు ఇంకా పూర్తిగా లేవు.'
  );
}

        let farmLocation =
          parameters.farmLocation;

        if (
          !farmLocation?.latitude ||
          !farmLocation?.longitude
        ) {
          farmLocation =
            await new Promise(
              (resolve, reject) => {
                if (!navigator.geolocation) {
                  reject(
                    new Error(
                      'మీ బ్రౌజర్ location support చేయడం లేదు.'
                    )
                  );
                  return;
                }

                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    resolve({
                      latitude:
                        position.coords.latitude,

                      longitude:
                        position.coords.longitude,

                      address:
                        user?.address ||
                        user?.village ||
                        'Current GPS location',

                      village:
                        user?.village || '',

                      landmark:
                        parameters.landmark || '',

                      locationInstructions:
                        parameters.locationInstructions ||
                        ''
                    });
                  },

                  () =>
                    reject(
                      new Error(
                        'బుకింగ్ కోసం మీ GPS location అనుమతించాలి.'
                      )
                    ),

                  {
                    enableHighAccuracy:
                      true,
                    timeout: 10000
                  }
                );
              }
            );
        }

        if (
          !farmLocation.landmark &&
          !farmLocation.locationInstructions
        ) {
          throw new Error(
            'దయచేసి మీ పొలం landmark లేదా location instructions చెప్పండి.'
          );
        }

        const bookingRes =
          await api.createBooking({
            farmerName: user.name,
            farmerPhone: user.phone,
            serviceId:
              parameters.serviceId,

            quantity:
              Number(parameters.quantity),

            bookingDate:
              parameters.bookingDate,

            timeSlot:
              parameters.timeSlot,

            farmLocation,

            paymentMethod:
              parameters.paymentMethod
          });

        if (!bookingRes.success) {
          throw new Error(
            bookingRes.message ||
              'బుకింగ్ చేయలేకపోయాను.'
          );
        }

        navigate(
          `/booking-success?id=${bookingRes.data._id}`
        );

        return `మీ బుకింగ్ విజయవంతంగా నమోదైంది. బుకింగ్ నంబర్ ${bookingRes.data.bookingId}.`;
      }

      case 'CANCEL_BOOKING': {
        if (!parameters.bookingId) {
          throw new Error(
            'ఏ booking ను cancel చేయాలో booking number చెప్పండి.'
          );
        }

        let bookingIdForApi =
          parameters.bookingId;

        if (
          String(
            bookingIdForApi
          ).startsWith('STB-')
        ) {
          const bookingList =
            await api.getMyBookings();

          const matched =
            bookingList.data?.find(
              (booking) =>
                booking.bookingId ===
                bookingIdForApi
            );

          if (!matched) {
            throw new Error(
              'ఆ booking మీ ఖాతాలో కనుగొనబడలేదు.'
            );
          }

          bookingIdForApi =
            matched._id;
        }

        const cancelRes =
          await api.cancelBooking(
            bookingIdForApi,

            parameters.reason ||
              'Cancelled by customer through Telugu AI assistant'
          );

        if (!cancelRes.success) {
          throw new Error(
            cancelRes.message ||
              'బుకింగ్ cancel చేయలేకపోయాను.'
          );
        }

        navigate(
          '/farmer-dashboard'
        );

        return 'మీ బుకింగ్ రద్దు చేయబడింది.';
      }

      case 'ASSIGN_RIDER_AND_TRACTOR': {
        if (user?.role !== 'admin') {
          throw new Error(
            'ఈ చర్య అడ్మిన్‌కు మాత్రమే అందుబాటులో ఉంది.'
          );
        }

        if (
          !parameters.bookingId ||
          !parameters.riderId ||
          !parameters.tractorId
        ) {
          throw new Error(
            'Booking, rider మరియు tractor వివరాలు అవసరం.'
          );
        }

        const assignRes =
          await api.assignRiderAndTractor(
            parameters.bookingId,
            parameters.riderId,
            parameters.tractorId
          );

        if (!assignRes.success) {
          throw new Error(
            assignRes.message ||
              'Rider మరియు tractor assign చేయలేకపోయాను.'
          );
        }

        return 'Rider మరియు tractor విజయవంతంగా assign చేశాను.';
      }

      case 'VERIFY_PAYMENT': {
        if (user?.role !== 'admin') {
          throw new Error(
            'Payment verification అడ్మిన్‌కు మాత్రమే అందుబాటులో ఉంది.'
          );
        }

        if (
          !parameters.paymentId ||
          !['ACCEPT', 'REJECT'].includes(
            parameters.action
          )
        ) {
          throw new Error(
            'Payment ID మరియు ACCEPT లేదా REJECT action అవసరం.'
          );
        }

        const verifyRes =
          await api.verifyPayment(
            parameters.paymentId,
            parameters.action,
            parameters.notes || ''
          );

        if (!verifyRes.success) {
          throw new Error(
            verifyRes.message ||
              'Payment verification పూర్తి కాలేదు.'
          );
        }

        return parameters.action ===
          'ACCEPT'
          ? 'Payment విజయవంతంగా ఆమోదించబడింది.'
          : 'Payment విజయవంతంగా reject చేయబడింది.';
      }

      default:
        return null;
    }
  };

  const sendMessage = async (
    messageOverride = null
  ) => {
    const message =
      String(
        messageOverride ?? input
      ).trim();

    if (!message || loading) {
      return;
    }

    setInput('');

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: message
      }
    ]);

    setLoading(true);

    try {
      const history =
        messages
          .slice(-8)
          .map((item) => ({
            role: item.role,
            content: item.content
          }));

      const res =
        await api.askAIAssistant(
          message,
          history
        );

      const result =
        res.data;
      // Keep all booking information collected so far.
if (
  result.action === 'CREATE_BOOKING' &&
  result.parameters
) {
  setBookingDraft((prev) => ({
    ...prev,
    ...result.parameters
  }));
}

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.reply
        }
      ]);

      speakTelugu(
        result.reply
      );

      const confirmationActions =
  new Set([
    'CANCEL_BOOKING',
    'ASSIGN_RIDER_AND_TRACTOR',
    'VERIFY_PAYMENT'
  ]);

if (
  (
    result.requiresConfirmation ||
    confirmationActions.has(
      result.action
    )
  ) &&
  result.action !== 'NONE'
) {
  setPendingAction(result);
} else if (
  result.action !== 'NONE'
) {
        try {
          const actionReply =
            await executeAction(
              result.action,
              result.parameters
            );

          if (actionReply) {
            setMessages(
              (prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: actionReply
                }
              ]
            );

            speakTelugu(
              actionReply
            );
          }
        } catch (actionError) {
          setMessages(
            (prev) => [
              ...prev,
              {
                role: 'assistant',
                content:
                  actionError.message
              }
            ]
          );

          speakTelugu(
            actionError.message
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        'క్షమించండి, ప్రస్తుతం AI సహాయకుడు అందుబాటులో లేడు.';

      setMessages(
        (prev) => [
          ...prev,
          {
            role: 'assistant',
            content: errorMessage
          }
        ]
      );

      speakTelugu(
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmPendingAction =
    async () => {
      if (!pendingAction) {
        return;
      }

      const action =
        pendingAction;

      setPendingAction(null);
      setLoading(true);

      try {
        const reply =
          await executeAction(
            action.action,
            action.parameters
          );

        setMessages(
          (prev) => [
            ...prev,
            {
              role: 'assistant',
              content: reply
            }
          ]
        );

        speakTelugu(reply);
      } catch (error) {
        const reply =
          error.message ||
          'చర్యను పూర్తి చేయలేకపోయాను.';

        setMessages(
          (prev) => [
            ...prev,
            {
              role: 'assistant',
              content: reply
            }
          ]
        );

        speakTelugu(reply);
      } finally {
        setLoading(false);
      }
    };

  const startListening = () => {
    if (
      !browserSupportsVoice ||
      listening ||
      loading
    ) {
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      'te-IN';

    recognition.continuous =
      false;

    recognition.interimResults =
      false;

    recognition.onstart = () =>
      setListening(true);

    recognition.onresult = (
      event
    ) => {
      const transcript =
        event.results?.[0]?.[0]
          ?.transcript || '';

      setInput(
        transcript
      );

      if (
        transcript.trim()
      ) {
        sendMessage(
          transcript
        );
      }
    };

    recognition.onerror = (
      event
    ) => {
      console.error(
        'Telugu speech recognition error:',
        event.error
      );

      setListening(false);
    };

    recognition.onend = () =>
      setListening(false);

    recognitionRef.current =
      recognition;

    recognition.start();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="fixed right-5 bottom-5 z-[100] w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 shadow-2xl flex flex-col items-center justify-center text-emerald-900 hover:scale-105 transition-all"
          title="తెలుగు AI సహాయకుడు"
          aria-label="తెలుగు AI సహాయకుడు"
        >
          <Bot className="w-8 h-8" />

          <span className="text-[9px] font-black mt-1">
            మాట్లాడండి
          </span>
        </button>
      )}

      {open && (
        <div className="fixed right-4 bottom-4 z-[100] w-[min(390px,calc(100vw-2rem))] h-[min(650px,calc(100vh-2rem))] bg-white/90 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

          <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white px-4 py-4 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>

              <div>
                <p className="font-black text-sm">
                  తెలుగు AI సహాయకుడు
                </p>

                <p className="text-[10px] text-emerald-100">
                  వెబ్‌సైట్‌ను మీ మాటలతో ఉపయోగించండి
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="p-2 rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {messages.map(
              (message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs leading-5 ${
                      message.role ===
                      'user'
                        ? 'bg-emerald-700 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ఆలోచిస్తున్నాను...
                </div>
              </div>
            )}

            <div
              ref={messagesEndRef}
            />
          </div>

          {pendingAction && (
            <div className="mx-3 mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">

              <p className="text-xs font-bold text-amber-900 mb-2">
                ఈ చర్యను కొనసాగించనా?
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    confirmPendingAction
                  }
                  className="flex-1 bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  అవును
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPendingAction(
                      null
                    )
                  }
                  className="flex-1 bg-white border border-gray-300 text-gray-700 text-xs font-bold py-2 rounded-xl"
                >
                  వద్దు
                </button>

              </div>
            </div>
          )}

          <div className="p-3 border-t border-gray-200 bg-white/80">

            {!browserSupportsVoice && (
              <p className="text-[10px] text-amber-700 mb-2">
                ఈ browser లో voice recognition support లేదు. Chrome ఉపయోగించండి.
              </p>
            )}

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={
                  startListening
                }
                disabled={
                  !browserSupportsVoice ||
                  listening ||
                  loading
                }
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                  listening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-100 text-emerald-800'
                } disabled:opacity-50`}
                title="తెలుగులో మాట్లాడండి"
              >
                {listening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <input
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    'Enter'
                  ) {
                    sendMessage();
                  }
                }}
                placeholder="తెలుగులో మాట్లాడండి లేదా టైప్ చేయండి..."
                className="flex-1 min-w-0 text-xs px-3 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={() =>
                  sendMessage()
                }
                disabled={
                  !input.trim() ||
                  loading
                }
                className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default TeluguAIAssistant;
