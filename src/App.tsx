import { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { translations } from './i18n/translations';
import type { Language } from './i18n/translations';
import { FinancialReportModal } from './components/FinancialReport';
import './App.css';

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [gameStarted, setGameStarted] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

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
    buyItem,
    skipItem,
    saveToSavings,
    endMonth,
    resetGame,
    closeReport,
    isGameOver,
    isGameWon,
  } = useGameLogic();

  const t = translations[language];
  const isRTL = language === 'he';

  const handleRestartGame = () => {
    resetGame();
    setGameStarted(false);
    setShowRestartConfirm(false);
  };

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
    </div>
  );
}

export default App;
