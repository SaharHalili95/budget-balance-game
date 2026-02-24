import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { translations } from './i18n/translations';
import type { Language } from './i18n/translations';
import { FinancialReportModal } from './components/FinancialReport';
import { MultiplayerMode } from './components/MultiplayerMode';
import { INVESTMENTS } from './types/investments';
import type { PlayerInvestment } from './types/investments';
import type { SavingsGoal } from './types/game';
import './App.css';

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [gameStarted, setGameStarted] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [multiplayerMode, setMultiplayerMode] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalIcon, setGoalIcon] = useState('🏠');

  const {
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
  } = useGameLogic();

  const t = translations[language];
  const isRTL = language === 'he';

  const handleRestartGame = () => {
    resetGame();
    setGameStarted(false);
    setShowRestartConfirm(false);
  };

  const handleInvest = () => {
    if (!selectedInvestment) return;
    const amount = parseInt(investAmount);
    if (isNaN(amount) || amount <= 0) return;
    const success = invest(selectedInvestment, amount);
    if (success) {
      setShowInvestModal(false);
      setSelectedInvestment(null);
      setInvestAmount('');
    }
  };

  // Multiplayer mode
  if (multiplayerMode) {
    return (
      <MultiplayerMode
        language={language}
        onBack={() => setMultiplayerMode(false)}
      />
    );
  }

  if (!gameStarted) {
    return (
      <div className={`app ${isRTL ? 'rtl' : ''}`}>
        <div className="start-screen">
          <div className="logo" role="img" aria-label="Money bag">💰</div>
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>

          <div className="language-selector">
            <button
              className={language === 'en' ? 'active' : ''}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              className={language === 'he' ? 'active' : ''}
              onClick={() => setLanguage('he')}
            >
              עברית
            </button>
          </div>

          <button className="btn-primary" onClick={() => setGameStarted(true)}>
            {t.startGame}
          </button>
          <button className="btn-secondary" onClick={() => setMultiplayerMode(true)}>
            👥 {t.multiplayer}
          </button>
        </div>
      </div>
    );
  }

  if (isGameOver || isGameWon) {
    return (
      <div className={`app ${isRTL ? 'rtl' : ''}`}>
        <div className="game-over-screen">
          <div className="logo" role="img" aria-label={isGameWon ? 'Trophy' : 'Game over'}>{isGameWon ? '🏆' : '😢'}</div>
          <h1>{isGameWon ? t.youWin : t.gameOver}</h1>
          <div className="final-stats">
            <div className="stat-item">
              <span>{t.month}</span>
              <strong>{gameState.month}</strong>
            </div>
            <div className="stat-item">
              <span>Level</span>
              <strong>{gameState.level}</strong>
            </div>
            <div className="stat-item">
              <span>{t.score}</span>
              <strong>{gameState.score}</strong>
            </div>
            <div className="stat-item">
              <span>{t.savings}</span>
              <strong>₪{gameState.savings.toLocaleString()}</strong>
            </div>
            <div className="stat-item">
              <span>Achievements</span>
              <strong>{gameState.achievements.length}/{allAchievements.length}</strong>
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              resetGame();
              setGameStarted(false);
            }}
          >
            {t.newGame}
          </button>
        </div>
      </div>
    );
  }

  const needsPurchases = currentPurchases.filter((p) => p.category === 'need');
  const wantsPurchases = currentPurchases.filter((p) => p.category === 'want');
  const progress = (gameState.savings / gameState.financialGoal) * 100;
  const levelProgressDenom = nextLevel
    ? nextLevel.requiredScore - (currentLevel?.requiredScore || 0)
    : 1;
  const levelProgress = nextLevel && levelProgressDenom > 0
    ? Math.max(0, Math.min(100,
        ((gameState.score - (currentLevel?.requiredScore || 0)) / levelProgressDenom) * 100))
    : 100;

  return (
    <div className={`app ${isRTL ? 'rtl' : ''}`}>
      {notification && <div className="notification">{notification}</div>}
      {levelUpNotification && (
        <div className="notification level-up">{levelUpNotification}</div>
      )}
      {achievementUnlocked && (
        <div className="achievement-popup">
          <div className="achievement-icon">{achievementUnlocked.icon}</div>
          <div className="achievement-content">
            <h3>🎊 Achievement Unlocked!</h3>
            <p className="achievement-name">
              {language === 'he'
                ? achievementUnlocked.nameHe
                : achievementUnlocked.name}
            </p>
          </div>
        </div>
      )}
      {currentReport && (
        <FinancialReportModal
          report={currentReport}
          language={language}
          onClose={closeReport}
        />
      )}

      {/* Random Event Modal */}
      {currentEvent && (
        <div className="achievements-overlay" onClick={currentEvent.type === 'choice' ? undefined : dismissEvent}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-icon">
              {currentEvent.type === 'expense' ? '💸' : currentEvent.type === 'income' ? '🎉' : '🤔'}
            </div>
            <h2 className="event-modal-title">
              {currentEvent.type === 'expense' ? t.eventExpense : currentEvent.type === 'income' ? t.eventIncome : t.eventChoice}
            </h2>
            <h3 className="event-modal-subtitle">{currentEvent.title}</h3>
            <p className="event-modal-desc">{currentEvent.description}</p>
            {currentEvent.type !== 'choice' && currentEvent.amount && (
              <p className={`event-modal-amount ${currentEvent.type === 'expense' ? 'red' : 'green'}`}>
                {currentEvent.type === 'expense' ? '-' : '+'}₪{currentEvent.amount.toLocaleString()}
              </p>
            )}
            {currentEvent.type === 'choice' && currentEvent.choices ? (
              <div className="event-choices">
                {currentEvent.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    className={choice.isNeed ? 'btn-secondary' : 'btn-primary'}
                    onClick={() => handleEventChoice(idx)}
                  >
                    {choice.label}
                    {choice.cost > 0 && <span className="choice-cost"> (₪{choice.cost})</span>}
                  </button>
                ))}
              </div>
            ) : (
              <button className="btn-primary" onClick={dismissEvent}>
                {t.dismiss}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="achievements-overlay" onClick={() => setShowInvestModal(false)}>
          <div className="invest-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📈 {t.investments}</h2>
              <button className="close-btn" aria-label="Close" onClick={() => setShowInvestModal(false)}>
                ×
              </button>
            </div>
            <div className="invest-grid">
              {INVESTMENTS.map((inv) => {
                const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
                const riskLabels = { low: t.low, medium: t.medium, high: t.high };
                return (
                  <div
                    key={inv.id}
                    className={`invest-option ${selectedInvestment === inv.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedInvestment(inv.id);
                      setInvestAmount(String(inv.minAmount));
                    }}
                  >
                    <div className="invest-option-header">
                      <h3>{language === 'he' ? inv.nameHe : inv.name}</h3>
                      <span className="risk-badge" style={{ color: riskColors[inv.riskLevel] }}>
                        {riskLabels[inv.riskLevel]}
                      </span>
                    </div>
                    <p className="invest-option-desc">
                      {language === 'he' ? inv.descriptionHe : inv.description}
                    </p>
                    <p className="invest-option-range">
                      {t.returns}: {inv.monthlyReturnRange[0]}% ~ {inv.monthlyReturnRange[1]}%
                    </p>
                    <p className="invest-option-min">{t.minInvestment}: ₪{inv.minAmount}</p>
                  </div>
                );
              })}
            </div>
            {selectedInvestment && (
              <div className="invest-form">
                <label>{t.investAmount}</label>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="mp-input"
                  min={INVESTMENTS.find(i => i.id === selectedInvestment)?.minAmount || 500}
                />
                <button className="btn-primary" onClick={handleInvest}>
                  {t.invest}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showRestartConfirm && (
        <div className="achievements-overlay" onClick={() => setShowRestartConfirm(false)}>
          <div className="restart-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ {t.confirmRestart}</h2>
              <button className="close-btn" aria-label="Close" onClick={() => setShowRestartConfirm(false)}>
                ×
              </button>
            </div>
            <div className="restart-confirm-content">
              <p>{t.confirmRestartMessage}</p>
              <div className="restart-stats">
                <div className="restart-stat">
                  <span>{t.month}</span>
                  <strong>{gameState.month}</strong>
                </div>
                <div className="restart-stat">
                  <span>Level</span>
                  <strong>{gameState.level}</strong>
                </div>
                <div className="restart-stat">
                  <span>{t.savings}</span>
                  <strong>₪{gameState.savings.toLocaleString()}</strong>
                </div>
                <div className="restart-stat">
                  <span>{t.score}</span>
                  <strong>{gameState.score}</strong>
                </div>
              </div>
            </div>
            <div className="restart-confirm-actions">
              <button className="btn-danger" onClick={handleRestartGame}>
                {t.yes}
              </button>
              <button className="btn-secondary" onClick={() => setShowRestartConfirm(false)}>
                {t.no}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="game-header">
        <div className="header-left">
          <h1>💰 {t.title}</h1>
          <button
            className="btn-small"
            onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
          >
            {language === 'en' ? 'עב' : 'EN'}
          </button>
          <button
            className="btn-small restart-btn"
            onClick={() => setShowRestartConfirm(true)}
            title={t.restartGame}
          >
            🔄 {t.restartGame}
          </button>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span>{t.month}</span>
            <strong>{gameState.month}</strong>
          </div>
          <div className="stat">
            <span>Level</span>
            <strong>{gameState.level}</strong>
          </div>
          <div className="stat highlight">
            <span>{t.balance}</span>
            <strong>₪{gameState.balance.toLocaleString()}</strong>
          </div>
          <div className="stat">
            <span>{t.score}</span>
            <strong>{gameState.score}</strong>
          </div>
          <button
            className="btn-small achievements-btn"
            onClick={() => setShowAchievements(!showAchievements)}
          >
            🏆 {gameState.achievements.length}
          </button>
        </div>
      </header>

      {showAchievements && (
        <div className="achievements-overlay" onClick={() => setShowAchievements(false)}>
          <div className="achievements-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏆 Achievements</h2>
              <button className="close-btn" aria-label="Close" onClick={() => setShowAchievements(false)}>
                ×
              </button>
            </div>
            <div className="achievements-grid">
              {allAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="ach-icon">{ach.icon}</div>
                  <h3>{language === 'he' ? ach.nameHe : ach.name}</h3>
                  <p>{language === 'he' ? ach.descriptionHe : ach.description}</p>
                  {!ach.unlocked && ach.maxProgress > 1 && (
                    <div className="ach-progress">
                      <div className="ach-progress-bar">
                        <div
                          className="ach-progress-fill"
                          style={{
                            width: `${(ach.progress / ach.maxProgress) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="ach-progress-text">
                        {ach.progress.toLocaleString()} /{' '}
                        {ach.maxProgress.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="game-content">
        <aside className="sidebar">
          <div className="card level-card">
            <div className="level-header">
              <span className="level-badge">Level {gameState.level}</span>
              <h3>{language === 'he' ? currentLevel?.nameHe : currentLevel?.name}</h3>
            </div>
            {nextLevel && (
              <>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(levelProgress, 100)}%` }}
                  />
                </div>
                <p className="progress-text">
                  {gameState.score} / {nextLevel.requiredScore} to Level {nextLevel.level}
                </p>
              </>
            )}
            {!nextLevel && <p className="max-level">⭐ Max Level!</p>}
          </div>

          {gameState.currentChallenge && (
            <div className="card challenge-card">
              <h3>🎯 Monthly Challenge</h3>
              <p className="challenge-desc">
                {language === 'he'
                  ? gameState.currentChallenge.descriptionHe
                  : gameState.currentChallenge.description}
              </p>
              <p className="challenge-reward">
                Reward: ₪{gameState.currentChallenge.reward}
              </p>
            </div>
          )}

          <div className="card">
            <h3>{t.goal}</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="progress-text">
              ₪{gameState.savings.toLocaleString()} / ₪
              {gameState.financialGoal.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <h3>{t.savings}</h3>
            <p className="big-number">₪{gameState.savings.toLocaleString()}</p>
            {gameState.level >= 2 && (
              <p className="savings-bonus">
                +{gameState.level >= 5 ? '30' : gameState.level >= 4 ? '20' : '10'}%
                interest
              </p>
            )}
            <button
              className="btn-secondary btn-full"
              onClick={() => saveToSavings(1000)}
              disabled={gameState.balance < 1000}
              title={gameState.balance < 1000 ? `Need ₪1,000 to save (current: ₪${gameState.balance.toLocaleString()})` : ''}
            >
              {t.save} ₪1000
            </button>
          </div>

          {/* Savings Goals */}
          <div className="card">
            <h3>🎯 יעדי חיסכון</h3>
            {(gameState.savingsGoals || []).length > 0 ? (
              <div className="goals-list">
                {(gameState.savingsGoals || []).map((goal: SavingsGoal) => {
                  const goalProgress = Math.min(gameState.savings / goal.targetAmount * 100, 100);
                  return (
                    <div key={goal.id} className={`goal-item ${goal.completed ? 'goal-completed' : ''}`}>
                      <div className="goal-header">
                        <span className="goal-icon-display">{goal.icon}</span>
                        <span className="goal-name">{goal.name}</span>
                        {goal.completed && <span className="goal-check">✅</span>}
                        {!goal.completed && (
                          <button className="goal-delete" onClick={() => deleteSavingsGoal(goal.id)}>✕</button>
                        )}
                      </div>
                      <div className="goal-progress-bar">
                        <div
                          className="goal-progress-fill"
                          style={{
                            width: `${goalProgress}%`,
                            background: goal.completed ? '#10b981' : '#6366f1',
                          }}
                        />
                      </div>
                      <p className="goal-progress-text">
                        ₪{Math.min(gameState.savings, goal.targetAmount).toLocaleString()} / ₪{goal.targetAmount.toLocaleString()}
                        <span className="goal-pct"> ({Math.round(goalProgress)}%)</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-dim">אין יעדים עדיין. הוסיפו אחד!</p>
            )}
            <button
              className="btn-primary btn-full"
              onClick={() => setShowGoalModal(true)}
              style={{ marginTop: '0.5rem' }}
            >
              + הוסף יעד
            </button>
          </div>

          {/* Investments Section */}
          <div className="card">
            <h3>📈 {t.investments}</h3>
            {gameState.level >= 4 ? (
              <>
                {gameState.investments.length > 0 ? (
                  <div className="investments-list">
                    {gameState.investments.map((inv: PlayerInvestment, idx: number) => {
                      const investData = INVESTMENTS.find(i => i.id === inv.investmentId);
                      const totalValue = inv.amount + inv.totalReturn;
                      const returnPct = inv.amount > 0 ? ((inv.totalReturn / inv.amount) * 100).toFixed(1) : '0';
                      return (
                        <div key={idx} className="investment-item">
                          <div className="investment-info">
                            <strong>{language === 'he' ? investData?.nameHe : investData?.name}</strong>
                            <span className="investment-value">₪{totalValue.toLocaleString()}</span>
                          </div>
                          <div className="investment-meta">
                            <span className={inv.totalReturn >= 0 ? 'green' : 'red'}>
                              {inv.totalReturn >= 0 ? '+' : ''}₪{inv.totalReturn.toLocaleString()} ({returnPct}%)
                            </span>
                            <button className="btn-small btn-danger" onClick={() => sellInvestment(idx)}>
                              {t.sell}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-dim">{t.noInvestments}</p>
                )}
                <button
                  className="btn-primary btn-full"
                  onClick={() => setShowInvestModal(true)}
                  style={{ marginTop: '0.5rem' }}
                >
                  {t.invest}
                </button>
              </>
            ) : (
              <div className="investment-locked">
                <span>🔒</span>
                <p>{t.investmentLockedDesc}</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3>📊 {t.monthlyProgress}</h3>
            <div className="mini-stat">
              <span>{t.income}</span>
              <strong className="green">
                +₪{gameState.monthlyIncome.toLocaleString()}
              </strong>
            </div>
            <div className="mini-stat">
              <span>{t.expenses}</span>
              <strong className="red">-₪{monthExpenses.toLocaleString()}</strong>
            </div>
            <div className="mini-stat">
              <span>Saved this month</span>
              <strong className="green">₪{monthSavings.toLocaleString()}</strong>
            </div>
          </div>

          <button className="btn-primary btn-full" onClick={endMonth}>
            {t.endMonth} →
          </button>
        </aside>

        <main className="main-content">
          {needsPurchases.length > 0 && (
            <section className="purchases-section">
              <h2 className="section-title needs-title">🏠 {t.needs}</h2>
              <div className="purchases-grid">
                {needsPurchases.map((purchase) => (
                  <div key={purchase.id} className="purchase-card need">
                    <div className="purchase-header">
                      <h3>{purchase.name}</h3>
                      <span className="price">₪{purchase.cost}</span>
                    </div>
                    <p className="purchase-desc">{purchase.description}</p>
                    <div className="purchase-actions">
                      <button
                        className="btn-primary"
                        onClick={() => buyItem(purchase)}
                      >
                        {t.buy}
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => skipItem(purchase.id)}
                      >
                        {t.skip}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {wantsPurchases.length > 0 && (
            <section className="purchases-section">
              <h2 className="section-title wants-title">✨ {t.wants}</h2>
              <div className="purchases-grid">
                {wantsPurchases.map((purchase) => (
                  <div key={purchase.id} className="purchase-card want">
                    <div className="purchase-header">
                      <h3>{purchase.name}</h3>
                      <span className="price">₪{purchase.cost}</span>
                    </div>
                    <p className="purchase-desc">{purchase.description}</p>
                    <div className="purchase-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => buyItem(purchase)}
                      >
                        {t.buy}
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={() => skipItem(purchase.id)}
                      >
                        {t.skip}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {currentPurchases.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>All decisions made!</h3>
              <p>Click "End Month" to continue</p>
            </div>
          )}
        </main>
      </div>
      {/* Goal Creation Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="goal-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h3>🎯 יעד חיסכון חדש</h3>
            <div className="goal-form">
              <label>שם היעד</label>
              <input
                type="text"
                value={goalName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoalName(e.target.value)}
                placeholder="למשל: רכב חדש"
                className="goal-input"
              />
              <label>סכום יעד (₪)</label>
              <input
                type="number"
                value={goalTarget}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoalTarget(e.target.value)}
                placeholder="10000"
                className="goal-input"
              />
              <label>אייקון</label>
              <div className="goal-icon-selector">
                {['🏠', '🚗', '🎓', '✈️', '💍', '📱', '🎮', '💻'].map((icon) => (
                  <button
                    key={icon}
                    className={`goal-icon-btn ${goalIcon === icon ? 'active' : ''}`}
                    onClick={() => setGoalIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="goal-form-actions">
                <button
                  className="btn-primary btn-full"
                  disabled={!goalName.trim() || !goalTarget || parseInt(goalTarget) <= 0}
                  onClick={() => {
                    createSavingsGoal(goalName.trim(), parseInt(goalTarget), goalIcon);
                    setGoalName('');
                    setGoalTarget('');
                    setGoalIcon('🏠');
                  }}
                >
                  צור יעד
                </button>
                <button
                  className="btn-ghost btn-full"
                  onClick={() => setShowGoalModal(false)}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Celebration */}
      {goalCelebration && (
        <div className="goal-celebration">
          <div className="goal-celebration-content">
            <div className="goal-celebration-emoji">🎉</div>
            <h3>יעד הושג!</h3>
            <p>{goalCelebration}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
