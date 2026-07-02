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
    timeLeft: 20, // 20 seconds
    customerName: 'Rahul Borah',
    customerPhone: '+91 94350 12345',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=128&h=128',
    customerRating: 4.8
  }
]

// Default simulation logs timestamp helper
const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const useRequestStore = create((set, get) => ({
  requests: INITIAL_REQUESTS,
  isMinimized: false,
  dispatchSimulation: {
    activeBookingId: 'REQ-3091',
    pickup: 'Guwahati Railway Station, Paltan Bazar, Guwahati',
    drop: 'Fancy Bazar, Guwahati, Assam',
    fare: 85.00,
    currentDriverIndex: 0, // 0 = You, 1 = Amit Sharma, 2 = Rajesh Gogoi
    status: 'contacting_you', // contacting_you | contacting_others | accepted | manual_assignment
    drivers: [
      { name: 'You (Nearest)', distance: '1.4 km', status: 'contacting', timer: 20 },
      { name: 'Amit Sharma (Partner)', distance: '3.1 km', status: 'pending', timer: 20 },
      { name: 'Rajesh Gogoi (Partner)', distance: '4.8 km', status: 'pending', timer: 20 }
    ],
    logs: [
      `[${getTimestamp()}] Booking REQ-3091 created by customer.`,
      `[${getTimestamp()}] Sequential Proximity Search: Found 3 available drivers within 5km radius.`,
      `[${getTimestamp()}] Contacting nearest driver: You (1.4 km).`
    ],
    adminNotified: false
  },

  setMinimized: (val) => set({ isMinimized: val }),

  declineRequest: (id) => set((state) => {
    const filtered = state.requests.filter(req => req.id !== id)
    
    // If the declined request is the one currently in simulation, transition immediately to the next driver!
    let simUpdate = {}
    if (state.dispatchSimulation && state.dispatchSimulation.activeBookingId === id && state.dispatchSimulation.status === 'contacting_you') {
      const updatedDrivers = [...state.dispatchSimulation.drivers]
      updatedDrivers[0].status = 'declined'
      updatedDrivers[0].timer = 0
      updatedDrivers[1].status = 'contacting'
      updatedDrivers[1].timer = 5 // Amit Sharma decides in 5 seconds for simulation speed

      const timeStr = getTimestamp()
      const newLogs = [
        ...state.dispatchSimulation.logs,
        `[${timeStr}] You declined the request.`,
        `[${timeStr}] Dispatching immediately to next nearest driver: Amit Sharma (3.1 km).`
      ]

      simUpdate = {
        dispatchSimulation: {
          ...state.dispatchSimulation,
          currentDriverIndex: 1,
          status: 'contacting_others',
          drivers: updatedDrivers,
          logs: newLogs
        }
      }
    }

    return {
      requests: filtered,
      ...simUpdate
    }
  }),

  acceptRequest: (id) => set((state) => {
    let simUpdate = {}
    if (state.dispatchSimulation && state.dispatchSimulation.activeBookingId === id) {
      const updatedDrivers = [...state.dispatchSimulation.drivers]
      updatedDrivers[0].status = 'accepted'
      
      const timeStr = getTimestamp()
      const newLogs = [
        ...state.dispatchSimulation.logs,
        `[${timeStr}] You accepted the ride request.`,
        `[${timeStr}] Booking assigned to You. Dispatch lifecycle completed.`
      ]

      simUpdate = {
        dispatchSimulation: {
          ...state.dispatchSimulation,
          status: 'accepted',
          drivers: updatedDrivers,
          logs: newLogs
        }
      }
    }
    return {
      requests: state.requests.filter(req => req.id !== id),
      ...simUpdate
    }
  }),

  clearSimulation: () => set({ dispatchSimulation: null }),

  tickTimers: () => set((state) => {
    const timeStr = getTimestamp()
    
    // Tick available requests
    const updatedRequests = state.requests.map(req => ({ 
      ...req, 
      timeLeft: Math.max(0, req.timeLeft - 1) 
    }))

    const activeRequests = updatedRequests.filter(req => req.timeLeft > 0)
    let requestsFiltered = activeRequests
    let simUpdate = {}

    // Handle active simulation state machine
    if (state.dispatchSimulation) {
      const sim = state.dispatchSimulation
      
      if (sim.status === 'contacting_you') {
        const updatedDrivers = [...sim.drivers]
        const currentTimer = Math.max(0, updatedDrivers[0].timer - 1)
        updatedDrivers[0].timer = currentTimer
        
        // If driver times out (reaches 0)
        if (currentTimer === 0) {
          updatedDrivers[0].status = 'timed_out'
          updatedDrivers[1].status = 'contacting'
          updatedDrivers[1].timer = 5 // Amit Sharma decides in 5 seconds

          const newLogs = [
            ...sim.logs,
            `[${timeStr}] Request expired for You (No response within 20s).`,
            `[${timeStr}] Dispatching immediately to next nearest driver: Amit Sharma (3.1 km).`
          ]

          simUpdate = {
            dispatchSimulation: {
              ...sim,
              currentDriverIndex: 1,
              status: 'contacting_others',
              drivers: updatedDrivers,
              logs: newLogs
            }
          }
          // Filter out the request since it expired for the current driver
          requestsFiltered = activeRequests.filter(req => req.id !== sim.activeBookingId)
        } else {
          // Just update timer in simulation
          simUpdate = {
            dispatchSimulation: {
              ...sim,
              drivers: updatedDrivers
            }
          }
          requestsFiltered = updatedRequests
        }
      } else if (sim.status === 'contacting_others') {
        const updatedDrivers = [...sim.drivers]
        const currentIdx = sim.currentDriverIndex
        const currentDriver = updatedDrivers[currentIdx]
        
        const newTimer = Math.max(0, currentDriver.timer - 1)
        updatedDrivers[currentIdx] = { ...currentDriver, timer: newTimer }

        if (newTimer === 0) {
          // Transition to next driver or exhaust them
          if (currentIdx === 1) {
            // Amit Sharma declined
            updatedDrivers[1].status = 'declined'
            updatedDrivers[2].status = 'contacting'
            updatedDrivers[2].timer = 6 // Rajesh Gogoi decides in 6 seconds

            const newLogs = [
              ...sim.logs,
              `[${timeStr}] Amit Sharma (3.1 km) declined the booking request.`,
              `[${timeStr}] Dispatching immediately to next nearest driver: Rajesh Gogoi (4.8 km).`
            ]

            simUpdate = {
              dispatchSimulation: {
                ...sim,
                currentDriverIndex: 2,
                drivers: updatedDrivers,
                logs: newLogs
              }
            }
          } else if (currentIdx === 2) {
            // Rajesh Gogoi timed out
            updatedDrivers[2].status = 'timed_out'
            
            const newLogs = [
              ...sim.logs,
              `[${timeStr}] Rajesh Gogoi (4.8 km) did not respond within the allotted time.`,
              `[${timeStr}] All available nearby drivers have been exhausted.`,
              `[${timeStr}] Immediate dispatch window threshold exceeded.`,
              `[${timeStr}] Transitioning booking ${sim.activeBookingId} to Pending Manual Assignment.`,
              `[${timeStr}] WhatsApp alert dispatched to administrator with direct assignment link.`
            ]

            simUpdate = {
              dispatchSimulation: {
                ...sim,
                status: 'manual_assignment',
                drivers: updatedDrivers,
                logs: newLogs,
                adminNotified: true
              }
            }
          }
        } else {
          simUpdate = {
            dispatchSimulation: {
              ...sim,
              drivers: updatedDrivers
            }
          }
        }
      }
    }

    return {
      requests: requestsFiltered,
      ...simUpdate
    }
  }),

  startSimulation: (req) => {
    set({
      dispatchSimulation: {
        activeBookingId: req.id,
        pickup: req.pickup,
        drop: req.drop,
        fare: req.fare,
        currentDriverIndex: 0,
        status: 'contacting_you',
        drivers: [
          { name: 'You (Nearest)', distance: req.distance || '1.4 km', status: 'contacting', timer: 20 },
          { name: 'Amit Sharma (Partner)', distance: '3.1 km', status: 'pending', timer: 20 },
          { name: 'Rajesh Gogoi (Partner)', distance: '4.8 km', status: 'pending', timer: 20 }
        ],
        logs: [
          `[${getTimestamp()}] Booking ${req.id} created by customer.`,
          `[${getTimestamp()}] Sequential Proximity Search: Found 3 available drivers within 5km radius.`,
          `[${getTimestamp()}] Contacting nearest driver: You (${req.distance || '1.4 km'}).`
        ],
        adminNotified: false
      }
    })
  },

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
      { name: 'Arup Nath', phone: '+91 91510 55566', rating: 4.6, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=128&h=128' }
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
      timeLeft: 20, // 20 seconds
      customerName: customers[idx].name,
      customerPhone: customers[idx].phone,
      customerAvatar: customers[idx].avatar,
      customerRating: customers[idx].rating
    }

    set((state) => ({ requests: [newReq, ...state.requests] }))
    
    // Start simulation
    get().startSimulation(newReq)
  },

  resetRequests: () => {
    set({ requests: INITIAL_REQUESTS })
    // Re-initialize first simulation
    get().startSimulation(INITIAL_REQUESTS[0])
  }
}))
