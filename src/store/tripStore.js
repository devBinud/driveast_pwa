import { create } from 'zustand'

const MOCK_TRIP_HISTORY = [
  {
    id: 'TRP-1092',
    pickup: 'Paltan Bazar, Guwahati, Assam',
    drop: 'Bhangagarh, Guwahati, Assam',
    date: 'June 22, 2026',
    time: '04:12 PM',
    distance: '2.1 km',
    duration: '9 mins',
    fare: 95.00,
    status: 'completed',
    paymentMethod: 'UPI (PhonePe)',
    customerName: 'Rishikesh Hazarika'
  },
  {
    id: 'TRP-0981',
    pickup: 'LGBI Airport, Borjhar, Guwahati',
    drop: 'Dispur, Guwahati, Assam',
    date: 'June 21, 2026',
    time: '11:30 AM',
    distance: '21.5 km',
    duration: '45 mins',
    fare: 420.00,
    status: 'completed',
    paymentMethod: 'Cash',
    customerName: 'Nilufar Begum'
  }
]

export const useTripStore = create((set, get) => ({
  trips: MOCK_TRIP_HISTORY,
  currentTrip: null,
  otpCode: '4820', // Default OTP for simulation
  otpInput: '',
  otpError: '',
  paymentMethod: 'Cash', // Default mock payment method
  
  setAssignedTrip: (req) => {
    set({
      currentTrip: {
        ...req,
        tripId: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'assigned', // assigned -> arrived -> otp_verified -> active -> payment_pending -> completed
        otpCode: Math.floor(1000 + Math.random() * 9000).toString(),
        routeProgress: 0
      },
      otpInput: '',
      otpError: '',
      paymentMethod: 'Cash'
    })
  },
  
  arriveAtPickup: () => {
    set((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, status: 'arrived' } : null
    }))
  },
  
  setOtpInput: (val) => set({ otpInput: val, otpError: '' }),
  
  verifyOtp: () => {
    const { currentTrip, otpInput } = get()
    if (!currentTrip) return false
    
    if (otpInput === currentTrip.otpCode || otpInput === '1234') { // '1234' is a master bypass OTP for testing
      set({
        currentTrip: { ...currentTrip, status: 'otp_verified' },
        otpError: ''
      })
      return true
    } else {
      set({ otpError: 'Invalid OTP. Please try again or ask customer.' })
      return false
    }
  },
  
  startTrip: () => {
    set((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, status: 'active' } : null
    }))
  },
  
  arriveAtDropoff: () => {
    set((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, status: 'payment_pending' } : null
    }))
  },
  
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  
  completeTrip: () => {
    const { currentTrip, paymentMethod } = get()
    if (!currentTrip) return
    
    const completedTrip = {
      id: currentTrip.tripId,
      pickup: currentTrip.pickup,
      drop: currentTrip.drop,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      distance: currentTrip.distance,
      duration: currentTrip.duration,
      fare: currentTrip.fare,
      status: 'completed',
      paymentMethod: paymentMethod,
      customerName: currentTrip.customerName
    }
    
    set((state) => ({
      trips: [completedTrip, ...state.trips],
      currentTrip: { ...currentTrip, status: 'completed' }
    }))
  },
  
  clearCurrentTrip: () => set({ currentTrip: null }),
  
  cancelTrip: () => {
    set({ currentTrip: null })
  }
}))
