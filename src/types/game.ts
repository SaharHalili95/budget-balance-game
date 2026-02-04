export interface GameState {
  month: number;
  balance: number;
  monthlyIncome: number;
  savings: number;
  score: number;
  level: number;
  streak: number;
  financialGoal: number;
  events: GameEvent[];
  history: MonthHistory[];
  achievements: string[]; // unlocked achievement IDs
  currentChallenge: any | null;
  completedChallenges: number;
  decisions: any[]; // Decision tracking
  monthlyAnalytics: any[]; // Monthly analytics reports
}

export interface MonthHistory {
  month: number;
  income: number;
  expenses: number;
  savings: number;
  balance: number;
}

export interface GameEvent {
  id: string;
  type: 'expense' | 'income' | 'choice';
  title: string;
  description: string;
  amount?: number;
  choices?: EventChoice[];
  impact?: string;
}

export interface EventChoice {
  label: string;
  cost: number;
  impact: {
    balance?: number;
    savings?: number;
    score?: number;
    futureEvent?: GameEvent;
  };
  isNeed: boolean; // true = need, false = want
}

export interface Purchase {
  id: string;
  name: string;
  cost: number;
  category: 'need' | 'want';
  impact: number; // impact on happiness/score
  description: string;
}

export const INITIAL_STATE: GameState = {
  month: 1,
  balance: 5000,
  monthlyIncome: 8000,
  savings: 0,
  score: 0,
  level: 1,
  streak: 0,
  financialGoal: 50000,
  events: [],
  history: [],
  achievements: [],
  currentChallenge: null,
  completedChallenges: 0,
  decisions: [],
  monthlyAnalytics: [],
};

export const CATEGORIES = {
  NEEDS: ['Rent', 'Groceries', 'Utilities', 'Transportation', 'Insurance'],
  WANTS: ['Entertainment', 'Dining Out', 'Shopping', 'Hobbies', 'Vacation'],
} as const;
