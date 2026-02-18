import { useState, useCallback } from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import type { Purchase } from '../types/game';
import { NEEDS, WANTS } from '../data/purchases';

interface PlayerState {
  name: string;
  balance: number;
  savings: number;
  score: number;
  monthExpenses: number;
}

interface Props {
  language: Language;
  onBack: () => void;
}

const TOTAL_ROUNDS = 6;
const MONTHLY_INCOME = 8000;
const STARTING_BALANCE = 5000;

export function MultiplayerMode({ language, onBack }: Props) {
  const t = translations[language];
  const isRTL = language === 'he';

  const [phase, setPhase] = useState<'setup' | 'playing' | 'switching' | 'results'>('setup');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);

  const [player1State, setPlayer1State] = useState<PlayerState>({
    name: '', balance: STARTING_BALANCE, savings: 0, score: 0, monthExpenses: 0,
  });
  const [player2State, setPlayer2State] = useState<PlayerState>({
    name: '', balance: STARTING_BALANCE, savings: 0, score: 0, monthExpenses: 0,
  });

  const [currentPurchases, setCurrentPurchases] = useState<Purchase[]>([]);

  const currentState = currentPlayer === 1 ? player1State : player2State;
  const setCurrentState = currentPlayer === 1 ? setPlayer1State : setPlayer2State;

  const startMatch = useCallback(() => {
    const p1 = player1Name.trim() || t.player1;
    const p2 = player2Name.trim() || t.player2;
    setPlayer1State({ name: p1, balance: STARTING_BALANCE, savings: 0, score: 0, monthExpenses: 0 });
    setPlayer2State({ name: p2, balance: STARTING_BALANCE, savings: 0, score: 0, monthExpenses: 0 });
    setCurrentPlayer(1);
    setCurrentRound(1);
    setCurrentPurchases([...NEEDS, ...WANTS].sort(() => Math.random() - 0.5));
    setPhase('playing');
  }, [player1Name, player2Name, t]);

  const buyItem = useCallback((purchase: Purchase) => {
    if (currentState.balance < purchase.cost) return;
    setCurrentState((prev) => ({
      ...prev,
      balance: prev.balance - purchase.cost,
      score: prev.score + purchase.impact,
      monthExpenses: prev.monthExpenses + purchase.cost,
    }));
    setCurrentPurchases((prev) => prev.filter((p) => p.id !== purchase.id));
  }, [currentState.balance, setCurrentState]);

  const skipItem = useCallback((purchaseId: string) => {
    setCurrentPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
  }, []);

  const saveToSavings = useCallback(() => {
    if (currentState.balance < 1000) return;
    setCurrentState((prev) => ({
      ...prev,
      balance: prev.balance - 1000,
      savings: prev.savings + 1000,
      score: prev.score + 10,
    }));
  }, [currentState.balance, setCurrentState]);

  const endTurn = useCallback(() => {
    const unpaidNeeds = currentPurchases.filter((p) => p.category === 'need');
    const penalty = unpaidNeeds.length > 0 ? 1000 : 0;

    setCurrentState((prev) => ({
      ...prev,
      balance: prev.balance + MONTHLY_INCOME - penalty,
      monthExpenses: 0,
    }));

    if (currentPlayer === 1) {
      setCurrentPlayer(2);
      setCurrentPurchases([...NEEDS, ...WANTS].sort(() => Math.random() - 0.5));
      setPhase('switching');
    } else {
      if (currentRound >= TOTAL_ROUNDS) {
        setPhase('results');
      } else {
        setCurrentRound((r) => r + 1);
        setCurrentPlayer(1);
        setCurrentPurchases([...NEEDS, ...WANTS].sort(() => Math.random() - 0.5));
        setPhase('switching');
      }
    }
  }, [currentPlayer, currentRound, currentPurchases, setCurrentState]);

  const continueFromSwitch = useCallback(() => {
    setPhase('playing');
  }, []);

  // Setup screen
  if (phase === 'setup') {
    return (
      <div className={`app ${isRTL ? 'rtl' : ''}`}>
        <div className="start-screen">
          <div className="logo" role="img">👥</div>
          <h1>{t.vsMode}</h1>
          <p className="subtitle">{t.enterNames}</p>
          <div className="mp-name-inputs">
            <div className="mp-name-field">
              <label>{t.player1}</label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder={t.player1}
                className="mp-input"
              />
            </div>
            <div className="mp-name-field">
              <label>{t.player2}</label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder={t.player2}
                className="mp-input"
              />
            </div>
          </div>
          <button className="btn-primary" onClick={startMatch}>
            {t.startMatch}
          </button>
          <button className="btn-ghost" onClick={onBack}>
            {t.backToMenu}
          </button>
        </div>
      </div>
    );
  }

  // Switching screen
  if (phase === 'switching') {
    const nextName = currentPlayer === 1 ? player1State.name : player2State.name;
    return (
      <div className={`app ${isRTL ? 'rtl' : ''}`}>
        <div className="start-screen">
          <div className="logo" role="img">🔄</div>
          <h1>{t.switchPlayer}</h1>
          <p className="subtitle">
            {nextName} - {t.nextPlayer}
          </p>
          <p className="subtitle">{t.round} {currentPlayer === 2 ? currentRound : currentRound} / {TOTAL_ROUNDS}</p>
          <button className="btn-primary" onClick={continueFromSwitch}>
            {t.clickToContinue}
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (phase === 'results') {
    const p1Total = player1State.balance + player1State.savings;
    const p2Total = player2State.balance + player2State.savings;
    const winner = p1Total > p2Total ? player1State.name : p2Total > p1Total ? player2State.name : null;

    return (
      <div className={`app ${isRTL ? 'rtl' : ''}`}>
        <div className="game-over-screen">
          <div className="logo" role="img">🏆</div>
          <h1>{t.finalResults}</h1>
          {winner ? (
            <p className="subtitle">{t.winner}: {winner}!</p>
          ) : (
            <p className="subtitle">{t.tie}</p>
          )}
          <div className="mp-results">
            <div className={`mp-result-card ${p1Total >= p2Total ? 'winner' : ''}`}>
              <h3>{player1State.name}</h3>
              <div className="mp-stat"><span>{t.balance}</span><strong>₪{player1State.balance.toLocaleString()}</strong></div>
              <div className="mp-stat"><span>{t.savings}</span><strong>₪{player1State.savings.toLocaleString()}</strong></div>
              <div className="mp-stat"><span>{t.totalScore}</span><strong>{player1State.score}</strong></div>
              <div className="mp-stat total"><span>Total</span><strong>₪{p1Total.toLocaleString()}</strong></div>
            </div>
            <div className="mp-vs">VS</div>
            <div className={`mp-result-card ${p2Total >= p1Total ? 'winner' : ''}`}>
              <h3>{player2State.name}</h3>
              <div className="mp-stat"><span>{t.balance}</span><strong>₪{player2State.balance.toLocaleString()}</strong></div>
              <div className="mp-stat"><span>{t.savings}</span><strong>₪{player2State.savings.toLocaleString()}</strong></div>
              <div className="mp-stat"><span>{t.totalScore}</span><strong>{player2State.score}</strong></div>
              <div className="mp-stat total"><span>Total</span><strong>₪{p2Total.toLocaleString()}</strong></div>
            </div>
          </div>
          <button className="btn-primary" onClick={onBack}>
            {t.backToMenu}
          </button>
        </div>
      </div>
    );
  }

  // Playing screen
  const needsPurchases = currentPurchases.filter((p) => p.category === 'need');
  const wantsPurchases = currentPurchases.filter((p) => p.category === 'want');
  const playerLabel = currentPlayer === 1 ? t.player1Turn : t.player2Turn;

  return (
    <div className={`app ${isRTL ? 'rtl' : ''}`}>
      <header className="game-header">
        <div className="header-left">
          <h1>👥 {currentState.name}</h1>
          <span className="mp-turn-badge">{playerLabel} - {t.round} {currentRound}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="header-stats">
          <div className="stat highlight">
            <span>{t.balance}</span>
            <strong>₪{currentState.balance.toLocaleString()}</strong>
          </div>
          <div className="stat">
            <span>{t.savings}</span>
            <strong>₪{currentState.savings.toLocaleString()}</strong>
          </div>
          <div className="stat">
            <span>{t.score}</span>
            <strong>{currentState.score}</strong>
          </div>
        </div>
      </header>

      <div className="game-content">
        <aside className="sidebar">
          <div className="card">
            <h3>{t.savings}</h3>
            <p className="big-number">₪{currentState.savings.toLocaleString()}</p>
            <button
              className="btn-secondary btn-full"
              onClick={saveToSavings}
              disabled={currentState.balance < 1000}
            >
              {t.save} ₪1000
            </button>
          </div>
          <button className="btn-primary btn-full" onClick={endTurn}>
            {t.endTurn} →
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
                      <button className="btn-primary" onClick={() => buyItem(purchase)}>{t.buy}</button>
                      <button className="btn-danger" onClick={() => skipItem(purchase.id)}>{t.skip}</button>
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
                      <button className="btn-secondary" onClick={() => buyItem(purchase)}>{t.buy}</button>
                      <button className="btn-ghost" onClick={() => skipItem(purchase.id)}>{t.skip}</button>
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
              <p>Click "{t.endTurn}" to continue</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
