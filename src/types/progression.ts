export interface Level {
  level: number;
  name: string;
  nameHe: string;
  requiredScore: number;
  unlockMessage: string;
  unlockMessageHe: string;
  perks: string[];
  perksHe: string[];
}

export interface Achievement {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface Challenge {
  id: string;
  type: 'save' | 'spend' | 'balance' | 'streak';
  target: number;
  reward: number;
  description: string;
  descriptionHe: string;
}

export const LEVELS: Level[] = [
  {
    level: 1,
    name: 'Budget Newbie',
    nameHe: 'מתחיל בתקציב',
    requiredScore: 0,
    unlockMessage: 'Starting your financial journey!',
    unlockMessageHe: 'מתחיל את המסע הפיננסי שלך!',
    perks: ['Basic budgeting'],
    perksHe: ['תקצוב בסיסי'],
  },
  {
    level: 2,
    name: 'Money Saver',
    nameHe: 'חוסך כסף',
    requiredScore: 100,
    unlockMessage: 'You\'re learning to save!',
    unlockMessageHe: 'אתה לומד לחסוך!',
    perks: ['+10% savings interest', 'Unlock Quick Save button'],
    perksHe: ['ריבית +10% על חיסכון', 'פתיחת כפתור חיסכון מהיר'],
  },
  {
    level: 3,
    name: 'Budget Master',
    nameHe: 'מאסטר תקציב',
    requiredScore: 300,
    unlockMessage: 'Smart financial decisions!',
    unlockMessageHe: 'החלטות פיננסיות חכמות!',
    perks: ['+₪500 monthly bonus', 'Reduced emergency costs'],
    perksHe: ['בונוס חודשי +₪500', 'עלויות חירום מופחתות'],
  },
  {
    level: 4,
    name: 'Investment Pro',
    nameHe: 'מקצוען השקעות',
    requiredScore: 600,
    unlockMessage: 'Making money work for you!',
    unlockMessageHe: 'גורם לכסף לעבוד בשבילך!',
    perks: ['+20% savings interest', 'Investment opportunities'],
    perksHe: ['ריבית +20% על חיסכון', 'הזדמנויות השקעה'],
  },
  {
    level: 5,
    name: 'Financial Guru',
    nameHe: 'גורו פיננסי',
    requiredScore: 1000,
    unlockMessage: 'You\'ve mastered money management!',
    unlockMessageHe: 'שלטת בניהול כסף!',
    perks: ['+₪1000 monthly bonus', '+30% savings interest', 'All perks unlocked'],
    perksHe: ['בונוס חודשי +₪1000', 'ריבית +30% על חיסכון', 'כל ההטבות פתוחות'],
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-save',
    name: 'First Steps',
    nameHe: 'צעדים ראשונים',
    description: 'Save money for the first time',
    descriptionHe: 'חסוך כסף בפעם הראשונה',
    icon: '💰',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'save-10k',
    name: 'Saver',
    nameHe: 'חסכן',
    description: 'Save ₪10,000',
    descriptionHe: 'חסוך ₪10,000',
    icon: '💵',
    unlocked: false,
    progress: 0,
    maxProgress: 10000,
  },
  {
    id: 'save-30k',
    name: 'Super Saver',
    nameHe: 'חסכן על',
    description: 'Save ₪30,000',
    descriptionHe: 'חסוך ₪30,000',
    icon: '💎',
    unlocked: false,
    progress: 0,
    maxProgress: 30000,
  },
  {
    id: 'month-5',
    name: 'Survivor',
    nameHe: 'שורד',
    description: 'Reach month 5',
    descriptionHe: 'הגע לחודש 5',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'month-10',
    name: 'Expert Survivor',
    nameHe: 'שורד מומחה',
    description: 'Reach month 10',
    descriptionHe: 'הגע לחודש 10',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'frugal',
    name: 'Frugal Living',
    nameHe: 'חיים צנועים',
    description: 'End a month spending less than 50% of income',
    descriptionHe: 'סיים חודש עם הוצאות פחות מ-50% מההכנסה',
    icon: '🌱',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'perfect-month',
    name: 'Perfect Balance',
    nameHe: 'איזון מושלם',
    description: 'Pay all needs and save ₪2000 in one month',
    descriptionHe: 'שלם את כל הצרכים וחסוך ₪2000 בחודש אחד',
    icon: '⚖️',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'no-wants',
    name: 'Disciplined',
    nameHe: 'ממושמע',
    description: 'Complete a month without buying any wants',
    descriptionHe: 'סיים חודש בלי לקנות אף רצון',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
];

export const generateMonthlyChallenge = (month: number): Challenge => {
  const challenges: Challenge[] = [
    {
      id: 'save-challenge',
      type: 'save',
      target: 2000 + month * 500,
      reward: 500,
      description: `Save ₪${2000 + month * 500} this month`,
      descriptionHe: `חסוך ₪${2000 + month * 500} החודש`,
    },
    {
      id: 'balance-challenge',
      type: 'balance',
      target: 8000 + month * 1000,
      reward: 300,
      description: `End month with ₪${8000 + month * 1000} balance`,
      descriptionHe: `סיים את החודש עם יתרה של ₪${8000 + month * 1000}`,
    },
    {
      id: 'spend-challenge',
      type: 'spend',
      target: 4000,
      reward: 400,
      description: 'Spend less than ₪4000 this month',
      descriptionHe: 'הוצא פחות מ-₪4000 החודש',
    },
  ];

  return challenges[month % challenges.length];
};
