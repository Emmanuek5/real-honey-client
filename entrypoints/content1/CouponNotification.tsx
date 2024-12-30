import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CouponData } from '@/lib/coupon-service';
import { showCouponTestModal } from './CouponTestModal';

interface CouponNotificationProps {
  couponsCount: number;
  coupons: CouponData[];
}

const CouponNotification: React.FC<CouponNotificationProps> = ({ couponsCount, coupons }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenExtension = () => {
    browser.runtime.sendMessage({ type: 'OPEN_EXTENSION' });
    setIsVisible(false);
  };

  const handleTestCoupons = (e: React.MouseEvent) => {
    e.stopPropagation();
    showCouponTestModal(coupons);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="honey-notification">
      <div className="honey-notification-header" onClick={handleOpenExtension} style={{ cursor: 'pointer' }}>
        <img src={browser.runtime.getURL('/real-honey.png')} alt="RealHoney" className="honey-notification-icon" />
        <div className="honey-notification-title-group">
          <span className="honey-notification-brand">RealHoney</span>
          <span className="honey-notification-subtitle">Automatic Coupon Finder</span>
        </div>
      </div>
      
      <div className="honey-notification-content">
        <div className="honey-notification-message">
          <div className="honey-notification-count">
            {couponsCount}
            <span className="honey-notification-count-label">
              {couponsCount === 1 ? 'COUPON' : 'COUPONS'}
            </span>
          </div>
          <p className="honey-notification-text">
            We found {couponsCount} {couponsCount === 1 ? 'coupon' : 'coupons'} for this store!
            Click to try them.
          </p>
        </div>
        <div className="honey-notification-footer">
          <button className="honey-notification-button honey-test-button" onClick={handleTestCoupons}>
            Test All Coupons
          </button>
          <button className="honey-notification-button" onClick={handleOpenExtension}>
            View Coupons
          </button>
        </div>
      </div>

      <style>
        {`
          .honey-notification-footer {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          }

          .honey-test-button {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
          }

          .honey-test-button:hover {
            background: rgba(255, 193, 7, 0.3);
          }
        `}
      </style>
    </div>
  );
};

export function showNotification(couponsCount: number, coupons: CouponData[]) {
  const container = document.createElement('div');
  container.id = 'honey-notification-container';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<CouponNotification couponsCount={couponsCount} coupons={coupons} />);

  // Clean up after animation
  setTimeout(() => {
    document.body.removeChild(container);
  }, 8500);
}
