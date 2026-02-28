import { IbadahType } from '../types';
import { Colors } from './theme';

export const DEFAULT_IBADAH_TYPES: Omit<IbadahType, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'quran',
    name: 'Quran',
    nameArabic: 'القرآن',
    unit: 'pages',
    icon: 'book-open',
    color: Colors.ibadah.quran,
    weight: 6,
    isDefault: true,
    isArchived: false,
    sortOrder: 0,
  },
  {
    id: 'qiyam',
    name: 'Qiyam',
    nameArabic: 'قيام الليل',
    unit: 'minutes',
    icon: 'moon',
    color: Colors.ibadah.qiyam,
    weight: 4,
    isDefault: true,
    isArchived: false,
    sortOrder: 1,
  },
  {
    id: 'dhikr',
    name: 'Dhikr',
    nameArabic: 'الذكر',
    unit: 'count',
    icon: 'heart',
    color: Colors.ibadah.dhikr,
    weight: 0.1,
    isDefault: true,
    isArchived: false,
    sortOrder: 2,
  },
  {
    id: 'sadaqah',
    name: 'Sadaqah',
    nameArabic: 'الصدقة',
    unit: 'currency',
    icon: 'gift',
    color: Colors.ibadah.sadaqah,
    weight: 8,
    isDefault: true,
    isArchived: false,
    sortOrder: 3,
  },
  {
    id: 'fasting',
    name: 'Fasting',
    nameArabic: 'الصيام',
    unit: 'binary',
    icon: 'sunrise',
    color: Colors.ibadah.fasting,
    weight: 100,
    isDefault: true,
    isArchived: false,
    sortOrder: 4,
  },
  {
    id: 'dua',
    name: 'Dua',
    nameArabic: 'الدعاء',
    unit: 'minutes',
    icon: 'message-circle',
    color: Colors.ibadah.dua,
    weight: 2,
    isDefault: true,
    isArchived: false,
    sortOrder: 5,
  },
];

export const PRESET_COUNTDOWN_DURATIONS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '20 min', seconds: 20 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
];

export const UNIT_LABELS: Record<
  string,
  { singular: string; plural: string; abbreviation: string }
> = {
  pages: { singular: 'page', plural: 'pages', abbreviation: 'pg' },
  minutes: { singular: 'minute', plural: 'minutes', abbreviation: 'min' },
  count: { singular: 'time', plural: 'times', abbreviation: 'x' },
  currency: { singular: 'AED', plural: 'AED', abbreviation: 'AED' },
  binary: { singular: 'day', plural: 'days', abbreviation: '' },
  ayat: { singular: 'ayah', plural: 'ayat', abbreviation: 'ayat' },
};

export const BURNOUT_THRESHOLD = 0.7;
export const CONSISTENCY_THRESHOLD = 0.8;
export const OVERLOAD_INCREASE_MIN = 1.05;
export const OVERLOAD_INCREASE_MAX = 1.1;
