import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CouponData } from '@/lib/coupon-service';
import { CouponTestResult, testCoupon } from '@/lib/coupon-tester';

interface CouponTestModalProps {
    coupons: CouponData[];
    onClose: () => void;
}

const CouponTestModal: React.FC<CouponTestModalProps> = ({ coupons, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<CouponTestResult[]>([]);
    const [testing, setTesting] = useState(true);
    const [bestCoupon, setBestCoupon] = useState<CouponTestResult | null>(null);

    useEffect(() => {
        const testCoupons = async () => {
            const allResults: CouponTestResult[] = [];

            for (let i = 0; i < coupons.length; i++) {
                setCurrentIndex(i);
                const result = await testCoupon(coupons[i]);
                allResults.push(result);
                setResults([...allResults]);

                if (result.success) {
                    if (!bestCoupon || (result.savings && bestCoupon.savings && result.savings > bestCoupon.savings)) {
                        setBestCoupon(result);
                    }
                }
            }

            setTesting(false);
        };

        testCoupons();
    }, [coupons]);

    return (
        <div className="honey-test-modal-overlay">
            <div className="honey-test-modal">
                <div className="honey-test-modal-header">
                    <img src={browser.runtime.getURL('/real-honey.png')} alt="RealHoney" className="honey-modal-icon" />
                    <h2>Testing Coupons</h2>
                    <button className="honey-modal-close" onClick={onClose}>×</button>
                </div>

                <div className="honey-test-modal-content">
                    {testing ? (
                        <>
                            <div className="honey-test-progress">
                                <div 
                                    className="honey-test-progress-bar"
                                    style={{ width: `${(currentIndex / coupons.length) * 100}%` }}
                                />
                            </div>
                            <p className="honey-test-status">
                                Testing coupon {currentIndex + 1} of {coupons.length}...
                            </p>
                        </>
                    ) : (
                        <div className="honey-test-results">
                            {bestCoupon ? (
                                <>
                                    <div className="honey-success-icon">✓</div>
                                    <h3>Best Coupon Found!</h3>
                                    <p className="honey-coupon-code">{bestCoupon.coupon.code}</p>
                                    {bestCoupon.savings && (
                                        <p className="honey-savings">Saved ${bestCoupon.savings.toFixed(2)}</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="honey-error-icon">×</div>
                                    <h3>No Working Coupons Found</h3>
                                    <p>We tested {coupons.length} coupons but none worked.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                    .honey-test-modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 999999;
                        backdrop-filter: blur(5px);
                    }

                    .honey-test-modal {
                        background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        border-radius: 16px;
                        width: 400px;
                        color: white;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }

                    .honey-test-modal-header {
                        padding: 20px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }

                    .honey-modal-icon {
                        width: 32px;
                        height: 32px;
                    }

                    .honey-test-modal-header h2 {
                        margin: 0;
                        font-size: 18px;
                        flex-grow: 1;
                    }

                    .honey-modal-close {
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 24px;
                        cursor: pointer;
                        padding: 0;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        transition: all 0.2s;
                    }

                    .honey-modal-close:hover {
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                    }

                    .honey-test-modal-content {
                        padding: 24px;
                    }

                    .honey-test-progress {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        height: 6px;
                        margin-bottom: 16px;
                        overflow: hidden;
                    }

                    .honey-test-progress-bar {
                        height: 100%;
                        background: #ffc107;
                        transition: width 0.3s ease;
                    }

                    .honey-test-status {
                        text-align: center;
                        margin: 0;
                        color: rgba(255, 255, 255, 0.8);
                    }

                    .honey-test-results {
                        text-align: center;
                    }

                    .honey-success-icon,
                    .honey-error-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }

                    .honey-success-icon {
                        color: #4caf50;
                    }

                    .honey-error-icon {
                        color: #f44336;
                    }

                    .honey-test-results h3 {
                        margin: 0 0 16px;
                        color: white;
                    }

                    .honey-coupon-code {
                        background: rgba(255, 193, 7, 0.1);
                        color: #ffc107;
                        padding: 8px 16px;
                        border-radius: 8px;
                        font-family: monospace;
                        font-size: 18px;
                        margin: 0 0 8px;
                        display: inline-block;
                    }

                    .honey-savings {
                        color: #4caf50;
                        font-weight: 600;
                        margin: 0;
                    }
                `}
            </style>
        </div>
    );
};

export function showCouponTestModal(coupons: CouponData[]) {
    const container = document.createElement('div');
    container.id = 'honey-test-modal-container';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
        <CouponTestModal
            coupons={coupons}
            onClose={() => {
                document.body.removeChild(container);
            }}
        />
    );
}
