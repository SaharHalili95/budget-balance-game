export interface DecisionRecord {
  id: string;
  month: number;
  timestamp: number;
  type: 'purchase' | 'skip' | 'save' | 'month_end';
  category?: 'need' | 'want';
  itemName?: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  impact: number;
}

export interface MonthlyAnalytics {
  month: number;
  totalIncome: number;
  totalExpenses: number;
  needsExpenses: number;
  wantsExpenses: number;
  totalSaved: number;
  savingsRate: number; // percentage
  decisions: DecisionRecord[];
  unpaidNeeds: number;
  skippedWants: number;
  boughtWants: number;
  score: number;
  level: number;
  challengeCompleted: boolean;
}

export interface FinancialReport {
  month: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  ratingHe: string;
  highlights: string[];
  highlightsHe: string[];
  concerns: string[];
  concernsHe: string[];
  recommendations: string[];
  recommendationsHe: string[];
  statistics: {
    savingsRate: number;
    needsRatio: number;
    wantsRatio: number;
    avgDecisionImpact: number;
    totalDecisions: number;
  };
  comparison: {
    vsLastMonth: {
      savings: number;
      expenses: number;
      score: number;
    };
    vsAverage: {
      savings: number;
      expenses: number;
    };
  };
}

export interface GameAnalytics {
  decisions: DecisionRecord[];
  monthlyReports: MonthlyAnalytics[];
  totalSavings: number;
  totalExpenses: number;
  totalIncome: number;
  averageSavingsRate: number;
  bestMonth: number;
  worstMonth: number;
  streaks: {
    currentSavingStreak: number;
    longestSavingStreak: number;
    perfectMonths: number;
  };
}
