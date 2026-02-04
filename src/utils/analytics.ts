import type { DecisionRecord, MonthlyAnalytics } from '../types/analytics';
import type { Purchase } from '../types/game';

let monthDecisions: DecisionRecord[] = [];
let monthNeedsExpenses = 0;
let monthWantsExpenses = 0;
let monthSkippedWants = 0;

export const trackPurchase = (
  purchase: Purchase,
  month: number,
  balanceBefore: number,
  balanceAfter: number
): DecisionRecord => {
  const decision: DecisionRecord = {
    id: `${Date.now()}-${Math.random()}`,
    month,
    timestamp: Date.now(),
    type: 'purchase',
    category: purchase.category,
    itemName: purchase.name,
    amount: purchase.cost,
    balanceBefore,
    balanceAfter,
    impact: purchase.impact,
  };

  monthDecisions.push(decision);

  if (purchase.category === 'need') {
    monthNeedsExpenses += purchase.cost;
  } else {
    monthWantsExpenses += purchase.cost;
  }

  return decision;
};

export const trackSkip = (
  purchase: Purchase,
  month: number,
  balance: number
): DecisionRecord => {
  const decision: DecisionRecord = {
    id: `${Date.now()}-${Math.random()}`,
    month,
    timestamp: Date.now(),
    type: 'skip',
    category: purchase.category,
    itemName: purchase.name,
    amount: 0,
    balanceBefore: balance,
    balanceAfter: balance,
    impact: 0,
  };

  monthDecisions.push(decision);

  if (purchase.category === 'want') {
    monthSkippedWants++;
  }

  return decision;
};

export const trackSave = (
  amount: number,
  month: number,
  balanceBefore: number,
  balanceAfter: number,
  impact: number
): DecisionRecord => {
  const decision: DecisionRecord = {
    id: `${Date.now()}-${Math.random()}`,
    month,
    timestamp: Date.now(),
    type: 'save',
    amount,
    balanceBefore,
    balanceAfter,
    impact,
  };

  monthDecisions.push(decision);

  return decision;
};

export const finalizeMonthAnalytics = (
  month: number,
  income: number,
  totalExpenses: number,
  totalSaved: number,
  unpaidNeeds: number,
  boughtWants: number,
  score: number,
  level: number,
  challengeCompleted: boolean
): MonthlyAnalytics => {
  const savingsRate = income > 0 ? (totalSaved / income) * 100 : 0;

  const analytics: MonthlyAnalytics = {
    month,
    totalIncome: income,
    totalExpenses,
    needsExpenses: monthNeedsExpenses,
    wantsExpenses: monthWantsExpenses,
    totalSaved,
    savingsRate,
    decisions: [...monthDecisions],
    unpaidNeeds,
    skippedWants: monthSkippedWants,
    boughtWants,
    score,
    level,
    challengeCompleted,
  };

  // Reset for next month
  monthDecisions = [];
  monthNeedsExpenses = 0;
  monthWantsExpenses = 0;
  monthSkippedWants = 0;

  return analytics;
};

export const calculateOverallStats = (analytics: MonthlyAnalytics[]) => {
  if (analytics.length === 0) {
    return {
      totalSavings: 0,
      totalExpenses: 0,
      totalIncome: 0,
      averageSavingsRate: 0,
      bestMonth: 0,
      worstMonth: 0,
    };
  }

  const totalSavings = analytics.reduce((sum, m) => sum + m.totalSaved, 0);
  const totalExpenses = analytics.reduce((sum, m) => sum + m.totalExpenses, 0);
  const totalIncome = analytics.reduce((sum, m) => sum + m.totalIncome, 0);
  const averageSavingsRate = analytics.reduce((sum, m) => sum + m.savingsRate, 0) / analytics.length;

  const bestMonth = analytics.reduce((best, current) =>
    current.savingsRate > best.savingsRate ? current : best
  ).month;

  const worstMonth = analytics.reduce((worst, current) =>
    current.savingsRate < worst.savingsRate ? current : worst
  ).month;

  return {
    totalSavings,
    totalExpenses,
    totalIncome,
    averageSavingsRate,
    bestMonth,
    worstMonth,
  };
};
