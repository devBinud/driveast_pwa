import { create } from 'zustand'

const INITIAL_REQUESTS = [
  {
    id: 'REQ-3091',
    pickup: 'Guwahati Railway Station, Paltan Bazar, Guwahati',
    pickupLatLng: [26.1844, 91.7458],
    drop: 'Fancy Bazar, Guwahati, Assam',
    dropLatLng: [26.1870, 91.7370],
    distance: '1.4 km',
    duration: '6 mins',
    fare: 85.00,
    timeLeft: 45,
    customerName: 'Rahul Borah',
    customerPhone: '+91 94350 12345',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=128&h=128',
    customerRating: 4.8
  },
  {
    id: 'REQ-4820',
    pickup: 'IIT Guwahati, North Guwahati, Assam',
    pickupLatLng: [26.1916, 91.6962],
    drop: 'Gauhati University, Jalukbari, Guwahati',
    dropLatLng: [26.1509, 91.7065],
    distance: '6.2 km',
    duration: '18 mins',
    fare: 145.00,
    timeLeft: 30,
    customerName: 'Priya Dutta',
    customerPhone: '+91 98540 67890',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=128&h=128',
    customerRating: 5.0
  },
  {
    id: 'REQ-5512',
    pickup: 'Sarusajai Stadium, Guwahati, Assam',
    pickupLatLng: [26.1850, 91.7720],
    drop: 'Lakhtokia, Guwahati, Assam',
    dropLatLng: [26.1745, 91.7540],
    distance: '3.8 km',
    duration: '12 mins',
    fare: 110.00,
    timeLeft: 55,
    customerName: 'Ankur Sharma',
    customerPhone: '+91 70110 45678',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=128&h=128',
    customerRating: 4.9
  }
]

export const useRequestStore = create((set, get) => ({
  requests: INITIAL_REQUESTS,
  
  declineRequest: (id) => set((state) => ({
    requests: state.requests.filter(req => req.id !== id)
  })),
  
  tickTimers: () => set((state) => {
    const updated = state.requests
      .map(req => ({ ...req, timeLeft: req.timeLeft - 1 }))
      .filter(req => req.timeLeft > 0)
    return { requests: updated }
  }),
  
  addMockRequest: () => {
    const ids = ['REQ-6123', 'REQ-7234', 'REQ-8345']
    const pickNames = [
      'Dispur, Guwahati, Assam',
      'Zoo Narengi, Guwahati, Assam',
      'Beltola Basistha Rd, Guwahati, Assam'
    ]
    const pickLatLngs = [[26.1405, 91.7882], [26.1780, 91.8070], [26.1200, 91.7690]]
    const dropNames = [
      'LGBI Airport, Borjhar, Guwahati',
      'Chandmari, Guwahati, Assam',
      'Six Mile, Guwahati, Assam'
    ]
    const dropLatLngs = [[26.1061, 91.5859], [26.1862, 91.7648], [26.1320, 91.8009]]
    const distances = ['22 km', '4.5 km', '7.1 km']
    const durations = ['40 mins', '14 mins', '22 mins']
    const fares = [380.00, 120.00, 195.00]
    const customers = [
      { name: 'Dipankar Kalita', phone: '+91 96780 11122', rating: 4.7, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=128&h=128' },
      { name: 'Meghna Das', phone: '+91 88760 33344', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=128&h=128' },
      { name: 'Bhaskar Nath', phone: '+91 91510 55566', rating: 4.6, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=128&h=128' }
    ]
    
    const idx = Math.floor(Math.random() * ids.length)
    
    // Check if request is already in list
    if (get().requests.some(req => req.id === ids[idx])) return
    
    const newReq = {
      id: ids[idx],
      pickup: pickNames[idx],
      pickupLatLng: pickLatLngs[idx],
      drop: dropNames[idx],
      dropLatLng: dropLatLngs[idx],
      distance: distances[idx],
      duration: durations[idx],
      fare: fares[idx],
      timeLeft: 45,
      customerName: customers[idx].name,
      customerPhone: customers[idx].phone,
      customerAvatar: customers[idx].avatar,
      customerRating: customers[idx].rating
    }
    
    set((state) => ({ requests: [newReq, ...state.requests] }))
  },
  
  resetRequests: () => set({ requests: INITIAL_REQUESTS })
}))

