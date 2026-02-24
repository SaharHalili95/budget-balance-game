import { useState, useCallback, useEffect, useMemo } from 'react';
import { INITIAL_STATE } from '../types/game';
import type { GameState, Purchase, GameEvent, SavingsGoal } from '../types/game';
import { NEEDS, WANTS, RANDOM_EVENTS } from '../data/purchases';
import { LEVELS, ACHIEVEMENTS, generateMonthlyChallenge } from '../types/progression';
import type { Achievement } from '../types/progression';
import { trackPurchase, trackSkip, trackSave, finalizeMonthAnalytics } from '../utils/analytics';
import { generateFinancialReport } from '../utils/reportGenerator';
import type { FinancialReport } from '../types/analytics';
import { INVESTMENTS } from '../types/investments';
import type { PlayerInvestment } from '../types/investments';

const STORAGE_KEY = 'budget-balance-save';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old saves
        return {
          ...INITIAL_STATE,
          ...parsed,
          achievements: parsed.achievements || [],
          currentChallenge: parsed.currentChallenge || generateMonthlyChallenge(parsed.month || 1),
          completedChallenges: parsed.completedChallenges || 0,
          level: parsed.level || 1,
        };
      } catch {
        console.error('Failed to parse saved game, resetting to initial state');
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return {
      ...INITIAL_STATE,
      currentChallenge: generateMonthlyChallenge(1),
    };
  });

  const [currentPurchases, setCurrentPurchases] = useState<Purchase[]>([]);
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [monthSavings, setMonthSavings] = useState(0);
  const [boughtWants, setBoughtWants] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<string | null>(null);
  const [achievementUnlocked, setAchievementUnlocked] = useState<Achievement | null>(null);
  const [currentReport, setCurrentReport] = useState<FinancialReport | null>(null);
  const [currentEvent, setCurrentEvent] = useState<typeof RANDOM_EVENTS[number] | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalCelebration, setGoalCelebration] = useState<string | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {
      console.error('Failed to save game state to localStorage');
    }
  }, [gameState]);

  // Initialize month
  useEffect(() => {
    const allPurchases = [...NEEDS, ...WANTS].sort(() => Math.random() - 0.5);
    setCurrentPurchases(allPurchases);
    setMonthExpenses(0);
    setMonthSavings(0);
    setBoughtWants(0);

    // Generate new challenge if needed
    if (!gameState.currentChallenge) {
      setGameState((prev) => ({
        ...prev,
        currentChallenge: generateMonthlyChallenge(prev.month),
      }));
    }
  }, [gameState.month]);

  // Check level up
  useEffect(() => {
    const nextLevel = LEVELS.find((l) => l.level === gameState.level + 1);

    if (nextLevel && gameState.score >= nextLevel.requiredScore) {
      setGameState((prev) => ({ ...prev, level: nextLevel.level }));
      setLevelUpNotification(`🎉 Level Up! ${nextLevel.name}`);
      setTimeout(() => setLevelUpNotification(null), 3000);
    }
  }, [gameState.score, gameState.level]);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const checkAchievements = useCallback((updatedState: GameState) => {
    const achievements = ACHIEVEMENTS.map((ach) => {
      if (gameState.achievements.includes(ach.id)) {
        return { ...ach, unlocked: true };
      }

      let progress = 0;
      let unlocked = false;

      switch (ach.id) {
        case 'first-save':
          progress = updatedState.savings > 0 ? 1 : 0;
          unlocked = progress >= ach.maxProgress;
          break;
        case 'save-10k':
          progress = Math.min(updatedState.savings, 10000);
          unlocked = updatedState.savings >= 10000;
          break;
        case 'save-30k':
          progress = Math.min(updatedState.savings, 30000);
          unlocked = updatedState.savings >= 30000;
          break;
        case 'month-5':
          progress = Math.min(updatedState.month, 5);
          unlocked = updatedState.month >= 5;
          break;
        case 'month-10':
          progress = Math.min(updatedState.month, 10);
          unlocked = updatedState.month >= 10;
          break;
      }

      if (unlocked && !gameState.achievements.includes(ach.id)) {
        setAchievementUnlocked(ach);
        setTimeout(() => setAchievementUnlocked(null), 4000);
        return { ...ach, unlocked: true, progress };
      }

      return { ...ach, progress, unlocked };
    });

    const unlockedIds = achievements.filter((a) => a.unlocked).map((a) => a.id);
    if (unlockedIds.length > gameState.achievements.length) {
      setGameState((prev) => ({ ...prev, achievements: unlockedIds }));
    }
  }, [gameState.achievements]);

  const buyItem = useCallback(
    (purchase: Purchase) => {
      if (gameState.balance < purchase.cost) {
        showNotification('Not enough money!');
        return false;
      }

      const balanceBefore = gameState.balance;
      const balanceAfter = balanceBefore - purchase.cost;

      // Track the decision
      const decision = trackPurchase(purchase, gameState.month, balanceBefore, balanceAfter);

      setGameState((prev) => {
        const newState = {
          ...prev,
          balance: balanceAfter,
          score: prev.score + purchase.impact,
          decisions: [...prev.decisions, decision],
        };
        checkAchievements(newState);
        return newState;
      });

      setMonthExpenses((prev) => prev + purchase.cost);

      if (purchase.category === 'want') {
        setBoughtWants((prev) => prev + 1);
      }

      setCurrentPurchases((prev) => prev.filter((p) => p.id !== purchase.id));

      if (purchase.category === 'need') {
        showNotification('✅ Good choice!');
      } else {
        showNotification('💸 Expensive choice!');
      }

      return true;
    },
    [gameState.balance, gameState.month, gameState.decisions, showNotification, checkAchievements]
  );

  const skipItem = useCallback((purchaseId: string) => {
    const purchase = currentPurchases.find((p) => p.id === purchaseId);
    if (purchase) {
      const decision = trackSkip(purchase, gameState.month, gameState.balance);
      setGameState((prev) => ({
        ...prev,
        decisions: [...prev.decisions, decision],
      }));
    }
    setCurrentPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
  }, [currentPurchases, gameState.month, gameState.balance, gameState.decisions]);

  const saveToSavings = useCallback(
    (amount: number) => {
      if (gameState.balance < amount) {
        showNotification('Not enough money!');
        return false;
      }

      // Calculate interest based on level
      const currentLevelData = LEVELS.find((l) => l.level === gameState.level);
      let interestBonus = 0;
      if (currentLevelData) {
        if (gameState.level >= 5) interestBonus = 0.3;
        else if (gameState.level >= 4) interestBonus = 0.2;
        else if (gameState.level >= 2) interestBonus = 0.1;
      }

      const bonusAmount = Math.floor(amount * interestBonus);
      const balanceBefore = gameState.balance;
      const balanceAfter = balanceBefore - amount;
      const impact = Math.floor(amount / 100) + bonusAmount;

      // Track the decision
      const decision = trackSave(amount, gameState.month, balanceBefore, balanceAfter, impact);

      setGameState((prev) => {
        const newState = {
          ...prev,
          balance: balanceAfter,
          savings: prev.savings + amount + bonusAmount,
          score: prev.score + impact,
          decisions: [...prev.decisions, decision],
        };
        checkAchievements(newState);
        return newState;
      });

      setMonthSavings((prev) => prev + amount);

      if (bonusAmount > 0) {
        showNotification(`💰 Saved ₪${amount} + ₪${bonusAmount} bonus!`);
      } else {
        showNotification(`💰 Saved ₪${amount}!`);
      }
      return true;
    },
    [gameState.balance, gameState.level, gameState.month, gameState.decisions, showNotification, checkAchievements]
  );

  // Random Events
  const triggerRandomEvent = useCallback(() => {
    if (Math.random() < 0.4) {
      const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      if (event.type === 'expense') {
        setGameState((prev) => ({
          ...prev,
          balance: prev.balance - event.amount,
          events: [...prev.events, {
            id: `event-${Date.now()}`,
            type: 'expense',
            title: event.title,
            description: event.description,
            amount: event.amount,
            impact: event.impact,
          } as GameEvent],
        }));
        setCurrentEvent(event);
      } else if (event.type === 'income') {
        setGameState((prev) => ({
          ...prev,
          balance: prev.balance + event.amount,
          events: [...prev.events, {
            id: `event-${Date.now()}`,
            type: 'income',
            title: event.title,
            description: event.description,
            amount: event.amount,
            impact: event.impact,
          } as GameEvent],
        }));
        setCurrentEvent(event);
      } else if (event.type === 'choice') {
        setCurrentEvent(event);
      }
    }
  }, []);

  const handleEventChoice = useCallback((choiceIndex: number) => {
    if (!currentEvent || currentEvent.type !== 'choice' || !currentEvent.choices) return;
    const choice = currentEvent.choices[choiceIndex];
    setGameState((prev) => ({
      ...prev,
      balance: prev.balance - choice.cost + (choice.impact.balance || 0),
      savings: prev.savings + (choice.impact.savings || 0),
      score: prev.score + (choice.impact.score || 0),
      events: [...prev.events, {
        id: `event-${Date.now()}`,
        type: 'choice',
        title: currentEvent.title,
        description: currentEvent.description,
        choices: currentEvent.choices,
      } as GameEvent],
    }));
    showNotification(choice.label);
    setCurrentEvent(null);
  }, [currentEvent, showNotification]);

  const dismissEvent = useCallback(() => {
    setCurrentEvent(null);
  }, []);

  // Investment functions
  const invest = useCallback((investmentId: string, amount: number) => {
    if (gameState.level < 4) {
      showNotification('Investments unlock at Level 4!');
      return false;
    }
    const investment = INVESTMENTS.find((i) => i.id === investmentId);
    if (!investment) return false;
    if (amount < investment.minAmount) {
      showNotification(`Minimum investment: ₪${investment.minAmount}`);
      return false;
    }
    if (gameState.balance < amount) {
      showNotification('Not enough money!');
      return false;
    }
    const playerInvestment: PlayerInvestment = {
      investmentId,
      amount,
      monthInvested: gameState.month,
      totalReturn: 0,
    };
    setGameState((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      investments: [...prev.investments, playerInvestment],
    }));
    showNotification(`📈 Invested ₪${amount} in ${investment.name}!`);
    return true;
  }, [gameState.balance, gameState.level, gameState.month, showNotification]);

  const sellInvestment = useCallback((index: number) => {
    const playerInv = gameState.investments[index];
    if (!playerInv) return false;
    const totalValue = playerInv.amount + playerInv.totalReturn;
    setGameState((prev) => ({
      ...prev,
      balance: prev.balance + totalValue,
      investments: prev.investments.filter((_: PlayerInvestment, i: number) => i !== index),
    }));
    const profit = playerInv.totalReturn;
    if (profit >= 0) {
      showNotification(`💰 Sold for ₪${totalValue.toLocaleString()} (+₪${profit.toLocaleString()} profit)!`);
    } else {
      showNotification(`📉 Sold for ₪${totalValue.toLocaleString()} (₪${profit.toLocaleString()} loss)`);
    }
    return true;
  }, [gameState.investments, showNotification]);

  const processInvestments = useCallback(() => {
    if (gameState.investments.length === 0) return;
    setGameState((prev) => ({
      ...prev,
      investments: prev.investments.map((inv: PlayerInvestment) => {
        const investment = INVESTMENTS.find((i) => i.id === inv.investmentId);
        if (!investment) return inv;
        const [minReturn, maxReturn] = investment.monthlyReturnRange;
        const returnPercent = minReturn + Math.random() * (maxReturn - minReturn);
        const monthlyReturn = Math.round((inv.amount + inv.totalReturn) * returnPercent / 100);
        return { ...inv, totalReturn: inv.totalReturn + monthlyReturn };
      }),
    }));
  }, [gameState.investments]);

  const endMonth = useCallback(() => {
    const income = gameState.monthlyIncome;
    const expenses = monthExpenses;
    const balance = gameState.balance;

    // Check unpaid essential bills
    const unpaidNeeds = currentPurchases.filter((p) => p.category === 'need');
    let penalty = 0;
    if (unpaidNeeds.length > 0) {
      penalty = 1000;
      showNotification('⚠️ Unpaid essential bills! -₪1000');
    }

    // Calculate bonuses
    let bonus = 0;
    let bonusMessage = '';

    // Level bonuses
    const currentLevelData = LEVELS.find((l) => l.level === gameState.level);
    if (currentLevelData) {
      if (gameState.level >= 5) {
        bonus += 1000;
        bonusMessage += ' +₪1000 (Guru bonus)';
      } else if (gameState.level >= 3) {
        bonus += 500;
        bonusMessage += ' +₪500 (Master bonus)';
      }
    }

    // Frugal bonus
    if (expenses < income * 0.5) {
      bonus += 500;
      bonusMessage += ' +₪500 (Frugal)';
      // Check frugal achievement
      if (!gameState.achievements.includes('frugal')) {
        const ach = ACHIEVEMENTS.find((a) => a.id === 'frugal');
        if (ach) {
          setAchievementUnlocked(ach);
          setTimeout(() => setAchievementUnlocked(null), 4000);
        }
      }
    }

    // Perfect month achievement
    if (unpaidNeeds.length === 0 && monthSavings >= 2000) {
      if (!gameState.achievements.includes('perfect-month')) {
        const ach = ACHIEVEMENTS.find((a) => a.id === 'perfect-month');
        if (ach) {
          setAchievementUnlocked(ach);
          setTimeout(() => setAchievementUnlocked(null), 4000);
        }
      }
    }

    // No wants achievement
    if (boughtWants === 0) {
      if (!gameState.achievements.includes('no-wants')) {
        const ach = ACHIEVEMENTS.find((a) => a.id === 'no-wants');
        if (ach) {
          setAchievementUnlocked(ach);
          setTimeout(() => setAchievementUnlocked(null), 4000);
        }
      }
    }

    // Check challenge completion
    let challengeBonus = 0;
    let completedChallenge = false;
    if (gameState.currentChallenge) {
      const challenge = gameState.currentChallenge;
      let completed = false;

      switch (challenge.type) {
        case 'save':
          completed = monthSavings >= challenge.target;
          break;
        case 'spend':
          completed = expenses <= challenge.target;
          break;
        case 'balance':
          completed = balance >= challenge.target;
          break;
      }

      if (completed) {
        challengeBonus = challenge.reward;
        bonusMessage += ` +₪${challengeBonus} (Challenge)`;
        completedChallenge = true;
      }
    }

    if (bonusMessage) {
      showNotification(`🎁 Bonuses:${bonusMessage}`);
    }

    // Finalize month analytics
    const monthlyAnalytics = finalizeMonthAnalytics(
      gameState.month,
      income,
      expenses,
      monthSavings,
      unpaidNeeds.length,
      boughtWants,
      gameState.score,
      gameState.level,
      completedChallenge
    );

    // Generate financial report
    const previousMonth = gameState.monthlyAnalytics.length > 0
      ? gameState.monthlyAnalytics[gameState.monthlyAnalytics.length - 1]
      : null;
    const report = generateFinancialReport(monthlyAnalytics, previousMonth, gameState.monthlyAnalytics);
    setCurrentReport(report);

    // Add to history
    const newHistory = [
      ...gameState.history,
      {
        month: gameState.month,
        income,
        expenses,
        savings: gameState.savings,
        balance,
      },
    ];

    // Process investments
    processInvestments();

    // New month
    const newMonth = gameState.month + 1;
    setGameState((prev) => {
      const newState = {
        ...prev,
        month: newMonth,
        balance: prev.balance + income + bonus + challengeBonus - penalty,
        history: newHistory,
        score: prev.score + bonus / 10,
        currentChallenge: generateMonthlyChallenge(newMonth),
        completedChallenges: completedChallenge ? prev.completedChallenges + 1 : prev.completedChallenges,
        monthlyAnalytics: [...prev.monthlyAnalytics, monthlyAnalytics],
      };
      checkAchievements(newState);
      return newState;
    });

    setMonthExpenses(0);
    setMonthSavings(0);
    setBoughtWants(0);

    // Trigger random event after month transition
    setTimeout(() => {
      triggerRandomEvent();
    }, 500);
  }, [gameState, monthExpenses, monthSavings, boughtWants, currentPurchases, showNotification, checkAchievements, triggerRandomEvent, processInvestments]);

  const resetGame = useCallback(() => {
    setGameState({
      ...INITIAL_STATE,
      currentChallenge: generateMonthlyChallenge(1),
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isGameOver = gameState.balance < 0;
  const isGameWon = gameState.savings >= gameState.financialGoal;

  const currentLevel = LEVELS.find((l) => l.level === gameState.level);
  const nextLevel = LEVELS.find((l) => l.level === gameState.level + 1);

  const allAchievements = useMemo(() => ACHIEVEMENTS.map((ach) => ({
    ...ach,
    unlocked: gameState.achievements.includes(ach.id),
  })), [gameState.achievements]);

  const closeReport = useCallback(() => {
    setCurrentReport(null);
  }, []);

  // Savings Goal functions
  const createSavingsGoal = useCallback((name: string, targetAmount: number, icon: string) => {
    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      name,
      targetAmount,
      icon,
      createdAtMonth: gameState.month,
      completed: false,
    };
    setGameState((prev: GameState) => ({
      ...prev,
      savingsGoals: [...(prev.savingsGoals || []), newGoal],
    }));
    setShowGoalModal(false);
    showNotification(`🎯 יעד חדש: ${name}!`);
  }, [gameState.month, showNotification]);

  const deleteSavingsGoal = useCallback((goalId: string) => {
    setGameState((prev: GameState) => ({
      ...prev,
      savingsGoals: (prev.savingsGoals || []).filter((g: SavingsGoal) => g.id !== goalId),
    }));
  }, []);

  // Check goals whenever savings change
  useEffect(() => {
    const goals: SavingsGoal[] = gameState.savingsGoals || [];
    const newlyCompleted = goals.filter(
      (g: SavingsGoal) => !g.completed && gameState.savings >= g.targetAmount
    );
    if (newlyCompleted.length > 0) {
      setGameState((prev: GameState) => ({
        ...prev,
        savingsGoals: (prev.savingsGoals || []).map((g: SavingsGoal) =>
          !g.completed && prev.savings >= g.targetAmount
            ? { ...g, completed: true, completedAtMonth: prev.month }
            : g
        ),
      }));
      setGoalCelebration(`${newlyCompleted[0].icon} ${newlyCompleted[0].name}`);
      setTimeout(() => setGoalCelebration(null), 4000);
    }
  }, [gameState.savings]);

  return {
    gameState,
    currentPurchases,
    monthExpenses,
    monthSavings,
    notification,
    levelUpNotification,
    achievementUnlocked,
    currentLevel,
    nextLevel,
    allAchievements,
    currentReport,
    currentEvent,
    buyItem,
    skipItem,
    saveToSavings,
    endMonth,
    resetGame,
    closeReport,
    handleEventChoice,
    dismissEvent,
    invest,
    sellInvestment,
    isGameOver,
    isGameWon,
    showGoalModal,
    setShowGoalModal,
    createSavingsGoal,
    deleteSavingsGoal,
    goalCelebration,
  };
};
