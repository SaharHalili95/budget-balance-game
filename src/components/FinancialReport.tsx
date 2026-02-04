import type { FinancialReport } from '../types/analytics';
import type { Language } from '../i18n/translations';
import '../styles/FinancialReport.css';

interface Props {
  report: FinancialReport;
  language: Language;
  onClose: () => void;
}

export const FinancialReportModal = ({ report, language, onClose }: Props) => {
  const isHe = language === 'he';
  const highlights = isHe ? report.highlightsHe : report.highlights;
  const concerns = isHe ? report.concernsHe : report.concerns;
  const recommendations = isHe ? report.recommendationsHe : report.recommendations;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#3b82f6';
      case 'fair':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return '🌟';
      case 'good':
        return '✅';
      case 'fair':
        return '⚠️';
      case 'poor':
        return '❌';
      default:
        return '📊';
    }
  };

  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="report-header">
          <div className="report-title-section">
            <h2>
              {isHe
                ? `דוח פיננסי - חודש ${report.month}`
                : `Financial Report - Month ${report.month}`}
            </h2>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <div
            className="rating-badge"
            style={{ backgroundColor: getRatingColor(report.rating) }}
          >
            <span className="rating-icon">{getRatingIcon(report.rating)}</span>
            <span className="rating-text">
              {isHe ? report.ratingHe : report.rating.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="report-content">
          {/* Statistics Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-label">{isHe ? 'שיעור חיסכון' : 'Savings Rate'}</div>
              <div className="stat-value">{report.statistics.savingsRate.toFixed(1)}%</div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${Math.min(report.statistics.savingsRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">{isHe ? 'צרכים' : 'Needs'}</div>
              <div className="stat-value">{report.statistics.needsRatio.toFixed(0)}%</div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill needs"
                  style={{ width: `${report.statistics.needsRatio}%` }}
                />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">{isHe ? 'רצונות' : 'Wants'}</div>
              <div className="stat-value">{report.statistics.wantsRatio.toFixed(0)}%</div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill wants"
                  style={{ width: `${report.statistics.wantsRatio}%` }}
                />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">{isHe ? 'החלטות' : 'Decisions'}</div>
              <div className="stat-value">{report.statistics.totalDecisions}</div>
            </div>
          </div>

          {/* Comparison */}
          <div className="comparison-section">
            <h3>{isHe ? '📊 השוואה' : '📊 Comparison'}</h3>
            <div className="comparison-grid">
              <div className="comparison-item">
                <span className="comparison-label">
                  {isHe ? 'לעומת חודש קודם' : 'vs Last Month'}
                </span>
                <div className="comparison-values">
                  <span
                    className={`comparison-value ${
                      report.comparison.vsLastMonth.savings >= 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {report.comparison.vsLastMonth.savings >= 0 ? '+' : ''}₪
                    {report.comparison.vsLastMonth.savings.toLocaleString()}
                    {isHe ? ' חיסכון' : ' savings'}
                  </span>
                  <span
                    className={`comparison-value ${
                      report.comparison.vsLastMonth.expenses <= 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {report.comparison.vsLastMonth.expenses >= 0 ? '+' : ''}₪
                    {report.comparison.vsLastMonth.expenses.toLocaleString()}
                    {isHe ? ' הוצאות' : ' expenses'}
                  </span>
                </div>
              </div>

              <div className="comparison-item">
                <span className="comparison-label">
                  {isHe ? 'לעומת ממוצע' : 'vs Average'}
                </span>
                <div className="comparison-values">
                  <span
                    className={`comparison-value ${
                      report.comparison.vsAverage.savings >= 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {report.comparison.vsAverage.savings >= 0 ? '+' : ''}₪
                    {report.comparison.vsAverage.savings.toLocaleString()}
                    {isHe ? ' חיסכון' : ' savings'}
                  </span>
                  <span
                    className={`comparison-value ${
                      report.comparison.vsAverage.expenses <= 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {report.comparison.vsAverage.expenses >= 0 ? '+' : ''}₪
                    {report.comparison.vsAverage.expenses.toLocaleString()}
                    {isHe ? ' הוצאות' : ' expenses'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="report-section highlights-section">
              <h3>✨ {isHe ? 'נקודות חיוביות' : 'Highlights'}</h3>
              <ul>
                {highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {concerns.length > 0 && (
            <div className="report-section concerns-section">
              <h3>⚠️ {isHe ? 'נקודות לשיפור' : 'Concerns'}</h3>
              <ul>
                {concerns.map((concern, i) => (
                  <li key={i}>{concern}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="report-section recommendations-section">
            <h3>💡 {isHe ? 'המלצות רואה החשבון' : 'Accountant Recommendations'}</h3>
            <ul>
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="report-footer">
          <button className="btn-primary" onClick={onClose}>
            {isHe ? 'המשך' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
