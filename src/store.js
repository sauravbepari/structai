import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      login: (password) => {
        const MASTER_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'structai2024'
        if (password === MASTER_PASSWORD) {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },
      logout: () => set({ isAuthenticated: false }),

      // Active code standard
      codeStandard: 'ACI318', // 'ACI318' | 'BNBC2020'
      setCodeStandard: (code) => set({ codeStandard: code }),

      // Chat history
      chatHistory: [],
      addMessage: (msg) => set((state) => ({
        chatHistory: [...state.chatHistory, { ...msg, id: Date.now(), timestamp: new Date().toISOString() }]
      })),
      clearChat: () => set({ chatHistory: [] }),

      // Training Hub
      trainingData: [],
      addTrainingData: (item) => set((state) => ({
        trainingData: [...state.trainingData, { ...item, id: Date.now(), timestamp: new Date().toISOString() }]
      })),
      removeTrainingData: (id) => set((state) => ({
        trainingData: state.trainingData.filter(i => i.id !== id)
      })),

      // Knowledge base
      knowledgeBase: {
        foundations: [],
        sections: [],
        rebarSchedules: [],
        notes: [],
      },
      addKnowledge: (category, item) => set((state) => ({
        knowledgeBase: {
          ...state.knowledgeBase,
          [category]: [...(state.knowledgeBase[category] || []), { ...item, id: Date.now() }]
        }
      })),
      removeKnowledge: (category, id) => set((state) => ({
        knowledgeBase: {
          ...state.knowledgeBase,
          [category]: state.knowledgeBase[category].filter(i => i.id !== id)
        }
      })),

      // Uploaded files history
      uploadedFiles: [],
      addUploadedFile: (file) => set((state) => ({
        uploadedFiles: [file, ...state.uploadedFiles].slice(0, 20)
      })),
    }),
    {
      name: 'structai-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        codeStandard: state.codeStandard,
        knowledgeBase: state.knowledgeBase,
        trainingData: state.trainingData,
        uploadedFiles: state.uploadedFiles,
      })
    }
  )
)
