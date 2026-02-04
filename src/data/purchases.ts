import type { Purchase } from '../types/game';

export const NEEDS: Purchase[] = [
  {
    id: 'rent',
    name: 'שכר דירה',
    cost: 3500,
    category: 'need',
    impact: 10,
    description: 'תשלום חובה חודשי - אי תשלום יגרום לבעיות חמורות',
  },
  {
    id: 'groceries',
    name: 'קניות מזון',
    cost: 1200,
    category: 'need',
    impact: 8,
    description: 'מזון בסיסי לחודש',
  },
  {
    id: 'utilities',
    name: 'חשמל ומים',
    cost: 400,
    category: 'need',
    impact: 5,
    description: 'חשבונות חיוניים',
  },
  {
    id: 'transport',
    name: 'תחבורה ציבורית',
    cost: 250,
    category: 'need',
    impact: 7,
    description: 'הגעה לעבודה',
  },
  {
    id: 'insurance',
    name: 'ביטוח בריאות',
    cost: 350,
    category: 'need',
    impact: 6,
    description: 'ביטוח חיוני',
  },
];

export const WANTS: Purchase[] = [
  {
    id: 'phone-new',
    name: 'טלפון חדש',
    cost: 2500,
    category: 'want',
    impact: 15,
    description: 'הטלפון הנוכחי עובד אבל מפתה לשדרג',
  },
  {
    id: 'dining',
    name: 'ארוחות במסעדות',
    cost: 800,
    category: 'want',
    impact: 12,
    description: 'ארוחות בחוץ במהלך החודש',
  },
  {
    id: 'streaming',
    name: 'מנויי סטרימינג',
    cost: 150,
    category: 'want',
    impact: 8,
    description: 'Netflix, Spotify וכו',
  },
  {
    id: 'gym',
    name: 'מנוי חדר כושר',
    cost: 250,
    category: 'want',
    impact: 10,
    description: 'השקעה בבריאות ורווחה',
  },
  {
    id: 'clothes',
    name: 'בגדים חדשים',
    cost: 600,
    category: 'want',
    impact: 9,
    description: 'אופנה ועדכון הארון',
  },
  {
    id: 'weekend',
    name: 'טיול סופ"ש',
    cost: 1200,
    category: 'want',
    impact: 14,
    description: 'בריחה קצרה מהשגרה',
  },
  {
    id: 'coffee',
    name: 'קפה יומי בבית קפה',
    cost: 300,
    category: 'want',
    impact: 7,
    description: '₪10 ליום',
  },
];

export const RANDOM_EVENTS = [
  {
    type: 'expense' as const,
    title: 'תיקון רכב דחוף',
    description: 'הרכב התקלקל ודרוש תיקון',
    amount: 1500,
    impact: 'הוצאה בלתי צפויה',
  },
  {
    type: 'expense' as const,
    title: 'טיפול שיניים',
    description: 'טיפול דחוף שאינו מכוסה בביטוח',
    amount: 800,
    impact: 'הוצאה רפואית',
  },
  {
    type: 'income' as const,
    title: 'בונוס בעבודה',
    description: 'קיבלת בונוס על ביצועים מצוינים!',
    amount: 2000,
    impact: 'הכנסה נוספת',
  },
  {
    type: 'income' as const,
    title: 'החזר מס',
    description: 'קיבלת החזר מס שנתי',
    amount: 1500,
    impact: 'הכנסה נוספת',
  },
  {
    type: 'choice' as const,
    title: 'הזדמנות השקעה',
    description: 'חבר מציע להשקיע יחד בפרויקט - סיכון בינוני',
    choices: [
      {
        label: 'להשקיע ₪3000',
        cost: 3000,
        impact: { balance: -3000, savings: 0, score: 10 },
        isNeed: false,
      },
      {
        label: 'לוותר על ההזדמנות',
        cost: 0,
        impact: { score: 5 },
        isNeed: true,
      },
    ],
  },
  {
    type: 'choice' as const,
    title: 'שדרוג דירה',
    description: 'דירה טובה יותר - שכירות +₪500/חודש',
    choices: [
      {
        label: 'לעבור לדירה החדשה',
        cost: 500,
        impact: { score: 15 },
        isNeed: false,
      },
      {
        label: 'להישאר בדירה הנוכחית',
        cost: 0,
        impact: { score: 5 },
        isNeed: true,
      },
    ],
  },
];
