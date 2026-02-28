import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IbadahType, IbadahUnit } from '../types';
import { DEFAULT_IBADAH_TYPES } from '../constants/defaults';
import { generateId } from '../utils/id';

interface IbadahState {
  ibadahTypes: IbadahType[];
  isLoaded: boolean;
}

interface IbadahActions {
  initializeDefaults: () => void;
  addIbadahType: (data: {
    name: string;
    nameArabic?: string;
    unit: IbadahUnit;
    icon: string;
    color: string;
    weight?: number;
  }) => IbadahType;
  updateIbadahType: (id: string, updates: Partial<IbadahType>) => void;
  archiveIbadahType: (id: string) => void;
  restoreIbadahType: (id: string) => void;
  reorderIbadahTypes: (orderedIds: string[]) => void;
  getActiveIbadahTypes: () => IbadahType[];
  getIbadahTypeById: (id: string) => IbadahType | undefined;
}

export const useIbadahStore = create<IbadahState & IbadahActions>()(
  persist(
    (set, get) => ({
      ibadahTypes: [],
      isLoaded: false,

      initializeDefaults: () => {
        const { ibadahTypes } = get();
        const now = new Date();

        if (ibadahTypes.length === 0) {
          const defaultTypes: IbadahType[] = DEFAULT_IBADAH_TYPES.map((type) => ({
            ...type,
            createdAt: now,
            updatedAt: now,
          }));
          set({ ibadahTypes: defaultTypes, isLoaded: true });
        } else {
          let updatedTypes = [...ibadahTypes];
          let needsUpdate = false;

          updatedTypes = updatedTypes.map((type) => {
            const defaultType = DEFAULT_IBADAH_TYPES.find((d) => d.id === type.id);
            if (defaultType) {
              const hasWeight = type.weight !== undefined && type.weight !== null;
              const needsUnitUpdate = type.id === 'fasting' && type.unit !== 'binary';
              if (!hasWeight || needsUnitUpdate) {
                needsUpdate = true;
                return {
                  ...type,
                  weight: defaultType.weight,
                  unit: defaultType.unit,
                  updatedAt: now,
                };
              }
            }
            if (type.weight === undefined || type.weight === null) {
              needsUpdate = true;
              return { ...type, weight: 1, updatedAt: now };
            }
            return type;
          });

          const existingIds = updatedTypes.map((t) => t.id);
          const newDefaults = DEFAULT_IBADAH_TYPES.filter((d) => !existingIds.includes(d.id));
          if (newDefaults.length > 0) {
            needsUpdate = true;
            const newTypes: IbadahType[] = newDefaults.map((type) => ({
              ...type,
              createdAt: now,
              updatedAt: now,
            }));
            updatedTypes = [...updatedTypes, ...newTypes];
          }

          if (needsUpdate) {
            set({ ibadahTypes: updatedTypes, isLoaded: true });
          } else {
            set({ isLoaded: true });
          }
        }
      },

      addIbadahType: (data) => {
        const { ibadahTypes } = get();
        const now = new Date();
        const newType: IbadahType = {
          id: generateId(),
          ...data,
          weight: data.weight ?? 1,
          isDefault: false,
          isArchived: false,
          sortOrder: ibadahTypes.length,
          createdAt: now,
          updatedAt: now,
        };
        set({ ibadahTypes: [...ibadahTypes, newType] });
        return newType;
      },

      updateIbadahType: (id, updates) => {
        set((state) => ({
          ibadahTypes: state.ibadahTypes.map((type) =>
            type.id === id ? { ...type, ...updates, updatedAt: new Date() } : type
          ),
        }));
      },

      archiveIbadahType: (id) => {
        set((state) => ({
          ibadahTypes: state.ibadahTypes.map((type) =>
            type.id === id ? { ...type, isArchived: true, updatedAt: new Date() } : type
          ),
        }));
      },

      restoreIbadahType: (id) => {
        set((state) => ({
          ibadahTypes: state.ibadahTypes.map((type) =>
            type.id === id ? { ...type, isArchived: false, updatedAt: new Date() } : type
          ),
        }));
      },

      reorderIbadahTypes: (orderedIds) => {
        set((state) => ({
          ibadahTypes: state.ibadahTypes.map((type) => ({
            ...type,
            sortOrder: orderedIds.indexOf(type.id),
            updatedAt: new Date(),
          })),
        }));
      },

      getActiveIbadahTypes: () => {
        return get()
          .ibadahTypes.filter((type) => !type.isArchived)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getIbadahTypeById: (id) => {
        return get().ibadahTypes.find((type) => type.id === id);
      },
    }),
    {
      name: 'ajr-ibadah-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ ibadahTypes: state.ibadahTypes }),
    }
  )
);
