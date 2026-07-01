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

const MOCK_UPCOMING_TRIPS = [
  {
    id: 'SCH-4091',
    pickup: 'Guwahati Railway Station, Paltan Bazar, Guwahati',
    drop: 'LGBI Airport, Borjhar, Guwahati, Assam',
    date: 'July 12, 2026',
    time: '09:30 AM',
    distance: '21.5 km',
    duration: '45 mins',
    fare: 450.00,
    status: 'scheduled',
    customerName: 'Rahul Borah',
    customerRating: 4.8,
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=128&h=128',
    customerPhone: '+91 94350 12345'
  },
  {
    id: 'SCH-8820',
    pickup: 'Fancy Bazar, Guwahati, Assam',
    drop: 'IIT Guwahati, North Guwahati, Assam',
    date: 'July 15, 2026',
    time: '02:00 PM',
    distance: '18.2 km',
    duration: '35 mins',
    fare: 380.00,
    status: 'scheduled',
    customerName: 'Priya Dutta',
    customerRating: 5.0,
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=128&h=128',
    customerPhone: '+91 98540 67890'
  },
  {
    id: 'SCH-1052',
    pickup: 'Dispur, Guwahati, Assam',
    drop: 'Sarusajai Stadium, Guwahati, Assam',
    date: 'July 18, 2026',
    time: '06:15 PM',
    distance: '12.4 km',
    duration: '25 mins',
    fare: 260.00,
    status: 'scheduled',
    customerName: 'Ankur Sharma',
    customerRating: 4.7,
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=128&h=128',
    customerPhone: '+91 70110 45678'
  }
]

export const useTripStore = create((set, get) => ({
  trips: MOCK_TRIP_HISTORY,
  upcomingTrips: MOCK_UPCOMING_TRIPS,
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
