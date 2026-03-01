import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, SessionSet, SessionWithSets } from '../types';
import { generateId } from '../utils/id';
import { format } from 'date-fns';
import { useIbadahStore } from './ibadahStore';

interface SessionState {
  sessions: Session[];
  sessionSets: SessionSet[];
  activeSessionId: string | null;
  hiddenIbadahTypeIds: string[];
  qiyamAyatCount: number;
  isLoaded: boolean;
}

interface SessionActions {
  startSession: () => Session;
  continueSession: (sessionId: string) => void;
  endSession: (sessionId: string, notes?: string) => void;
  deleteSession: (sessionId: string) => void;
  checkAndExpireSession: () => boolean;
  getTodaySession: () => Session | undefined;
  getOrCreateTodaySession: () => Session;
  addSet: (data: {
    sessionId: string;
    ibadahTypeId: string;
    value: number;
    durationSeconds?: number;
    notes?: string;
  }) => SessionSet;
  updateSet: (setId: string, updates: Partial<SessionSet>) => void;
  deleteSet: (setId: string) => void;
  getSessionSets: (sessionId: string) => SessionSet[];
  getSessionWithSets: (sessionId: string) => SessionWithSets | undefined;
  getSessionsByDateRange: (startDate: string, endDate: string) => Session[];
  calculateSessionVolume: (sessionId: string) => number;
  getAllSessions: () => Session[];
  hideIbadahType: (ibadahTypeId: string) => void;
  showIbadahType: (ibadahTypeId: string) => void;
  toggleIbadahTypeVisibility: (ibadahTypeId: string) => void;
  isIbadahTypeHidden: (ibadahTypeId: string) => boolean;
  resetHiddenIbadahTypes: () => void;
  setQiyamAyatCount: (count: number) => void;
  addQiyamAyat: (count: number) => void;
  resetQiyamAyatCount: () => void;
}

const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

const SESSION_EXPIRATION_HOURS = 24;

const isSessionExpired = (session: Session): boolean => {
  if (session.completedAt) return false;
  const startedAt = new Date(session.startedAt).getTime();
  const hoursSinceStart = (Date.now() - startedAt) / (1000 * 60 * 60);
  return hoursSinceStart >= SESSION_EXPIRATION_HOURS;
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set, get) => ({
      sessions: [],
      sessionSets: [],
      activeSessionId: null,
      hiddenIbadahTypeIds: [],
      qiyamAyatCount: 0,
      isLoaded: false,

      startSession: () => {
        get().checkAndExpireSession();

        const todayDate = getTodayDateString();
        const existingSession = get().sessions.find(
          (s) => s.sessionDate === todayDate && !s.completedAt
        );

        if (existingSession) {
          set({ activeSessionId: existingSession.id });
          return existingSession;
        }

        const now = new Date();
        const newSession: Session = {
          id: generateId(),
          sessionDate: todayDate,
          startedAt: now,
          totalVolume: 0,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: newSession.id,
        }));

        return newSession;
      },

      continueSession: (sessionId) => {
        const now = new Date();
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  completedAt: undefined,
                  updatedAt: now,
                }
              : session
          ),
          activeSessionId: sessionId,
        }));
      },

      endSession: (sessionId, notes) => {
        const now = new Date();
        const volume = get().calculateSessionVolume(sessionId);

        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  completedAt: now,
                  totalVolume: volume,
                  notes: notes ?? session.notes,
                  updatedAt: now,
                }
              : session
          ),
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          sessionSets: state.sessionSets.filter((s) => s.sessionId !== sessionId),
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        }));
      },

      checkAndExpireSession: () => {
        const { sessions } = get();
        const expiredSessions = sessions.filter(
          (s) => !s.completedAt && isSessionExpired(s)
        );

        if (expiredSessions.length === 0) return false;

        const now = new Date();
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (!session.completedAt && isSessionExpired(session)) {
              const volume = get().calculateSessionVolume(session.id);
              return {
                ...session,
                completedAt: now,
                totalVolume: volume,
                updatedAt: now,
              };
            }
            return session;
          }),
          activeSessionId: null,
        }));

        return true;
      },

      getTodaySession: () => {
        const todayDate = getTodayDateString();
        return get().sessions.find((s) => s.sessionDate === todayDate);
      },

      getOrCreateTodaySession: () => {
        const existing = get().getTodaySession();
        if (existing) {
          set({ activeSessionId: existing.id });
          return existing;
        }
        return get().startSession();
      },

      addSet: (data) => {
        const { sessionSets } = get();
        const sessionSetCount = sessionSets.filter((s) => s.sessionId === data.sessionId).length;

        const now = new Date();
        const newSet: SessionSet = {
          id: generateId(),
          sessionId: data.sessionId,
          ibadahTypeId: data.ibadahTypeId,
          value: data.value,
          durationSeconds: data.durationSeconds,
          notes: data.notes,
          setOrder: sessionSetCount,
          loggedAt: now,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          sessionSets: [...state.sessionSets, newSet],
        }));

        const volume = get().calculateSessionVolume(data.sessionId);
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === data.sessionId
              ? { ...session, totalVolume: volume, updatedAt: new Date() }
              : session
          ),
        }));

        return newSet;
      },

      updateSet: (setId, updates) => {
        let sessionId: string | null = null;

        set((state) => {
          const updatedSets = state.sessionSets.map((s) => {
            if (s.id === setId) {
              sessionId = s.sessionId;
              return { ...s, ...updates, updatedAt: new Date() };
            }
            return s;
          });
          return { sessionSets: updatedSets };
        });

        if (sessionId) {
          const volume = get().calculateSessionVolume(sessionId);
          set((state) => ({
            sessions: state.sessions.map((session) =>
              session.id === sessionId
                ? { ...session, totalVolume: volume, updatedAt: new Date() }
                : session
            ),
          }));
        }
      },

      deleteSet: (setId) => {
        const setToDelete = get().sessionSets.find((s) => s.id === setId);
        if (!setToDelete) return;

        const sessionId = setToDelete.sessionId;

        set((state) => ({
          sessionSets: state.sessionSets.filter((s) => s.id !== setId),
        }));

        const volume = get().calculateSessionVolume(sessionId);
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, totalVolume: volume, updatedAt: new Date() }
              : session
          ),
        }));
      },

      getSessionSets: (sessionId) => {
        return get()
          .sessionSets.filter((s) => s.sessionId === sessionId)
          .sort((a, b) => a.setOrder - b.setOrder);
      },

      getSessionWithSets: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (!session) return undefined;

        const sets = get().getSessionSets(sessionId);
        return {
          ...session,
          sets: sets.map((s) => ({ ...s, ibadahType: undefined as never })),
        };
      },

      getSessionsByDateRange: (startDate, endDate) => {
        return get()
          .sessions.filter((s) => s.sessionDate >= startDate && s.sessionDate <= endDate)
          .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
      },

      calculateSessionVolume: (sessionId) => {
        const sets = get().sessionSets.filter((s) => s.sessionId === sessionId);
        const ibadahTypes = useIbadahStore.getState().ibadahTypes;
        
        return sets.reduce((total, s) => {
          const ibadahType = ibadahTypes.find((t) => t.id === s.ibadahTypeId);
          const weight = ibadahType?.weight ?? 1;
          return total + s.value * weight;
        }, 0);
      },

      getAllSessions: () => {
        return get().sessions.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
      },

      hideIbadahType: (ibadahTypeId) => {
        set((state) => ({
          hiddenIbadahTypeIds: state.hiddenIbadahTypeIds.includes(ibadahTypeId)
            ? state.hiddenIbadahTypeIds
            : [...state.hiddenIbadahTypeIds, ibadahTypeId],
        }));
      },

      showIbadahType: (ibadahTypeId) => {
        set((state) => ({
          hiddenIbadahTypeIds: state.hiddenIbadahTypeIds.filter((id) => id !== ibadahTypeId),
        }));
      },

      toggleIbadahTypeVisibility: (ibadahTypeId) => {
        set((state) => ({
          hiddenIbadahTypeIds: state.hiddenIbadahTypeIds.includes(ibadahTypeId)
            ? state.hiddenIbadahTypeIds.filter((id) => id !== ibadahTypeId)
            : [...state.hiddenIbadahTypeIds, ibadahTypeId],
        }));
      },

      isIbadahTypeHidden: (ibadahTypeId) => {
        return get().hiddenIbadahTypeIds.includes(ibadahTypeId);
      },

      resetHiddenIbadahTypes: () => {
        set({ hiddenIbadahTypeIds: [] });
      },

      setQiyamAyatCount: (count) => {
        set({ qiyamAyatCount: Math.max(0, count) });
      },

      addQiyamAyat: (count) => {
        set((state) => ({ qiyamAyatCount: state.qiyamAyatCount + count }));
      },

      resetQiyamAyatCount: () => {
        set({ qiyamAyatCount: 0 });
      },
    }),
    {
      name: 'ajr-session-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        sessionSets: state.sessionSets,
        hiddenIbadahTypeIds: state.hiddenIbadahTypeIds,
        qiyamAyatCount: state.qiyamAyatCount,
      }),
    }
  )
);
