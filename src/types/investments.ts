export interface Investment {
  id: string;
  name: string;
  nameHe: string;
  type: 'stocks' | 'crypto' | 'deposit';
  minAmount: number;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  descriptionHe: string;
  monthlyReturnRange: [number, number];
}

export interface PlayerInvestment {
  investmentId: string;
  amount: number;
  monthInvested: number;
  totalReturn: number;
}

export const INVESTMENTS: Investment[] = [
  {
    id: 'bank-deposit',
    name: 'Bank Deposit',
    nameHe: 'פיקדון בנקאי',
    type: 'deposit',
    minAmount: 1000,
    riskLevel: 'low',
    description: 'Safe and stable returns',
    descriptionHe: 'תשואה בטוחה ויציבה',
    monthlyReturnRange: [0.3, 0.8],
  },
  {
    id: 'index-fund',
    name: 'Index Fund',
    nameHe: 'קרן מדד',
    type: 'stocks',
    minAmount: 2000,
    riskLevel: 'medium',
    description: 'Market-tracking returns',
    descriptionHe: 'תשואה עוקבת שוק',
    monthlyReturnRange: [-2, 4],
  },
  {
    id: 'tech-stocks',
    name: 'Tech Stocks',
    nameHe: 'מניות טכנולוגיה',
    type: 'stocks',
    minAmount: 3000,
    riskLevel: 'medium',
    description: 'Higher potential returns',
    descriptionHe: 'פוטנציאל תשואה גבוה',
    monthlyReturnRange: [-5, 8],
  },
  {
    id: 'crypto-btc',
    name: 'Bitcoin',
    nameHe: 'ביטקוין',
    type: 'crypto',
    minAmount: 1000,
    riskLevel: 'high',
    description: 'Volatile but high potential',
    descriptionHe: 'תנודתי אבל פוטנציאל גבוה',
    monthlyReturnRange: [-15, 20],
  },
  {
    id: 'crypto-eth',
    name: 'Ethereum',
    nameHe: 'אתריום',
    type: 'crypto',
    minAmount: 500,
    riskLevel: 'high',
    description: 'Smart contract platform',
    descriptionHe: 'פלטפורמת חוזים חכמים',
    monthlyReturnRange: [-20, 25],
  },
];
