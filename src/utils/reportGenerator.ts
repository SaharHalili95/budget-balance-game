import type { MonthlyAnalytics, FinancialReport } from '../types/analytics';

export const generateFinancialReport = (
  currentMonth: MonthlyAnalytics,
  previousMonth: MonthlyAnalytics | null,
  allMonths: MonthlyAnalytics[]
): FinancialReport => {
  const { totalIncome, totalExpenses, needsExpenses, wantsExpenses, totalSaved, savingsRate } = currentMonth;

  // Calculate averages
  const avgExpenses = allMonths.length > 0
    ? allMonths.reduce((sum, m) => sum + m.totalExpenses, 0) / allMonths.length
    : totalExpenses;
  const avgSavings = allMonths.length > 0
    ? allMonths.reduce((sum, m) => sum + m.totalSaved, 0) / allMonths.length
    : totalSaved;

  // Determine rating
  let rating: 'excellent' | 'good' | 'fair' | 'poor';
  let ratingHe: string;

  if (savingsRate >= 40 && currentMonth.unpaidNeeds === 0) {
    rating = 'excellent';
    ratingHe = 'מצוין';
  } else if (savingsRate >= 25 && currentMonth.unpaidNeeds === 0) {
    rating = 'good';
    ratingHe = 'טוב';
  } else if (savingsRate >= 10 || currentMonth.unpaidNeeds <= 1) {
    rating = 'fair';
    ratingHe = 'סביר';
  } else {
    rating = 'poor';
    ratingHe = 'חלש';
  }

  // Generate highlights
  const highlights: string[] = [];
  const highlightsHe: string[] = [];

  if (savingsRate >= 30) {
    highlights.push(`Excellent savings rate of ${savingsRate.toFixed(1)}%!`);
    highlightsHe.push(`שיעור חיסכון מצוין של ${savingsRate.toFixed(1)}%!`);
  }

  if (currentMonth.unpaidNeeds === 0) {
    highlights.push('All essential expenses were paid on time');
    highlightsHe.push('כל ההוצאות החיוניות שולמו בזמן');
  }

  if (currentMonth.challengeCompleted) {
    highlights.push('Monthly challenge completed successfully!');
    highlightsHe.push('האתגר החודשי הושלם בהצלחה!');
  }

  if (wantsExpenses < needsExpenses * 0.5) {
    highlights.push('Great self-control with discretionary spending');
    highlightsHe.push('שליטה עצמית מצוינת בהוצאות רצוניות');
  }

  if (previousMonth && totalSaved > previousMonth.totalSaved * 1.2) {
    highlights.push('Savings increased by over 20% from last month');
    highlightsHe.push('החיסכון עלה ביותר מ-20% מהחודש הקודם');
  }

  // Generate concerns
  const concerns: string[] = [];
  const concernsHe: string[] = [];

  if (currentMonth.unpaidNeeds > 0) {
    concerns.push(`${currentMonth.unpaidNeeds} essential expense(s) were not paid`);
    concernsHe.push(`${currentMonth.unpaidNeeds} הוצאות חיוניות לא שולמו`);
  }

  if (savingsRate < 10) {
    concerns.push('Very low savings rate - aim for at least 20%');
    concernsHe.push('שיעור חיסכון נמוך מאוד - שאף ל-20% לפחות');
  }

  if (wantsExpenses > needsExpenses) {
    concerns.push('Discretionary spending exceeded essential expenses');
    concernsHe.push('הוצאות רצוניות עלו על הוצאות חיוניות');
  }

  if (previousMonth && totalExpenses > previousMonth.totalExpenses * 1.3) {
    concerns.push('Expenses increased significantly from last month');
    concernsHe.push('ההוצאות עלו משמעותית מהחודש הקודם');
  }

  if (totalSaved === 0) {
    concerns.push('No money was saved this month');
    concernsHe.push('לא נחסך כסף החודש');
  }

  // Generate recommendations
  const recommendations: string[] = [];
  const recommendationsHe: string[] = [];

  if (savingsRate < 20) {
    recommendations.push('Try to save at least 20% of your income each month');
    recommendationsHe.push('נסה לחסוך לפחות 20% מההכנסה שלך כל חודש');
  }

  if (wantsExpenses > totalIncome * 0.3) {
    recommendations.push('Reduce discretionary spending to below 30% of income');
    recommendationsHe.push('הפחת הוצאות רצוניות למטה מ-30% מההכנסה');
  }

  if (currentMonth.unpaidNeeds > 0) {
    recommendations.push('Always prioritize essential expenses before wants');
    recommendationsHe.push('תמיד תעדוף הוצאות חיוניות לפני רצונות');
  }

  if (currentMonth.skippedWants < 3 && wantsExpenses > needsExpenses * 0.5) {
    recommendations.push('Consider skipping more non-essential purchases');
    recommendationsHe.push('שקול לוותר על יותר רכישות לא חיוניות');
  }

  if (savingsRate >= 20 && currentMonth.unpaidNeeds === 0) {
    recommendations.push('Excellent work! Keep maintaining this financial discipline');
    recommendationsHe.push('עבודה מצוינת! המשך לשמור על המשמעת הפיננסית');
  }

  if (totalSaved < 1000 && totalIncome >= 8000) {
    recommendations.push('Try to save at least ₪1,000 per month for financial security');
    recommendationsHe.push('נסה לחסוך לפחות ₪1,000 בחודש לביטחון פיננסי');
  }

  // Calculate statistics
  const needsRatio = totalExpenses > 0 ? (needsExpenses / totalExpenses) * 100 : 0;
  const wantsRatio = totalExpenses > 0 ? (wantsExpenses / totalExpenses) * 100 : 0;
  const avgDecisionImpact = currentMonth.decisions.length > 0
    ? currentMonth.decisions.reduce((sum, d) => sum + Math.abs(d.impact), 0) / currentMonth.decisions.length
    : 0;

  // Calculate comparisons
  const vsLastMonth = previousMonth
    ? {
        savings: totalSaved - previousMonth.totalSaved,
        expenses: totalExpenses - previousMonth.totalExpenses,
        score: currentMonth.score - previousMonth.score,
      }
    : { savings: 0, expenses: 0, score: 0 };

  const vsAverage = {
    savings: totalSaved - avgSavings,
    expenses: totalExpenses - avgExpenses,
  };

  return {
    month: currentMonth.month,
    rating,
    ratingHe,
    highlights,
    highlightsHe,
    concerns,
    concernsHe,
    recommendations,
    recommendationsHe,
    statistics: {
      savingsRate,
      needsRatio,
      wantsRatio,
      avgDecisionImpact,
      totalDecisions: currentMonth.decisions.length,
    },
    comparison: {
      vsLastMonth,
      vsAverage,
    },
  };
};
