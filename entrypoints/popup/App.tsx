import { useEffect, useState } from 'react';
import { getCoupons } from '@/lib/functions';
import './App.css';
import { getCouponService } from '@/lib/coupon-service';

function App() {
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomainAndCoupons = async () => {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const url = tabs[0]?.url;
        if (!url) {
          setError('No active tab found');
          return;
        }

        const hostname = new URL(url).hostname;
        setCurrentDomain(hostname);
        setLoading(true);

        const response = await getCouponService().getAllForDomain(hostname);
        setCoupons(response);

        console.log(response);
        
        if (response.length === 0) {
          setError('No coupons found');
        }

      } catch (err: any) {
        console.error(err);
        setError(JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDomainAndCoupons();
  }, []);

  return (
    <div className="app-container">
      {/* Logo Section */}
      <div className="section logo-section">
        <div className="logo-content">
          <img 
            src="/real-honey.png" 
            alt="RealHoney" 
            className="logo-icon"
          />
          <h1>RealHoney</h1>
        </div>
      </div>

      {/* Domain Section */}
      <div className="section domain-section">
        <div className="domain-content">
          {currentDomain && (
            <img
              src={`https://www.google.com/s2/favicons?domain=${currentDomain}&sz=32`}
              alt=""
              className="favicon"
            />
          )}
          <span className="domain-name">{currentDomain}</span>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="section coupons-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="message-container">
            <p>No coupons found</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="message-container">
            <p>No coupons available for this store</p>
          </div>
        ) : (
          <div className="coupons-list">
            {coupons.map((coupon, index) => (
              <div
                key={index}
                className="coupon-card"
                onClick={() => {
                  navigator.clipboard.writeText(coupon.code);
                  const el = document.getElementById(`coupon-${index}`);
                  if (el) {
                    el.classList.add('copied');
                    setTimeout(() => el.classList.remove('copied'), 1500);
                  }
                }}
                id={`coupon-${index}`}
              >
                <div className="coupon-content">
                  <span className="coupon-title">{coupon.title}</span>
                  <div className="coupon-code-container">
                    <code className="coupon-code">{coupon.code}</code>
                    <span className="copy-indicator">
                      <span className="default">Click to copy</span>
                      <span className="copied">Copied!</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
