import { showNotification } from './content1/CouponNotification';

export default defineContentScript({
  matches: ["https://*.google.com/*","https://*.amazon.com/*","https://*.com/*"],
  main() {
    const url = new URL(window.location.href);
    const domain = url.hostname.replace('www.', '');
    console.log(domain);
    
    // Send domain to background script
    browser.runtime.sendMessage({ type: 'UPDATE_DOMAIN', domain });

    // Listen for coupon notifications
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'SHOW_COUPON_NOTIFICATION' && message.couponsCount > 0) {
        // Create notification element
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'honey-notification';
        notificationDiv.innerHTML = `
          <div class="honey-notification-header">
            <img src="${browser.runtime.getURL('/real-honey.png')}" alt="RealHoney" class="honey-notification-icon" />
            <div class="honey-notification-title-group">
              <span class="honey-notification-brand">RealHoney</span>
              <span class="honey-notification-subtitle">Automatic Coupon Finder</span>
            </div>
          </div>
          <div class="honey-notification-content">
            <div class="honey-notification-message">
              <div class="honey-notification-count">
                ${message.couponsCount}
                <span class="honey-notification-count-label">
                  ${message.couponsCount === 1 ? 'COUPON' : 'COUPONS'}
                </span>
              </div>
              <p class="honey-notification-text">
                We found ${message.couponsCount} ${message.couponsCount === 1 ? 'coupon' : 'coupons'} for this store!
                Click to try them.
              </p>
            </div>
            <div class="honey-notification-footer">
              <button class="honey-notification-button">Try Coupons</button>
            </div>
          </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
          .honey-notification {
            position: fixed;
            bottom: 32px;
            right: 32px;
            width: 360px;
            background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 16px;
            padding: 0;
            color: #ffffff;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
            z-index: 999999;
            animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                       fadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) 7.6s forwards;
            backdrop-filter: blur(10px);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: pointer;
          }

          .honey-notification * {
            cursor: pointer;
          }

          .honey-notification-header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transition: background-color 0.2s ease;
          }

          .honey-notification:hover .honey-notification-header {
            background: rgba(255, 255, 255, 0.03);
          }

          .honey-notification-icon {
            width: 40px;
            height: 40px;
            filter: drop-shadow(0 0 12px rgba(255, 193, 7, 0.2));
          }

          .honey-notification-title-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .honey-notification-brand {
            font-size: 18px;
            font-weight: 700;
            color: #ffc107;
            text-shadow: 0 0 20px rgba(255, 193, 7, 0.2);
            letter-spacing: -0.3px;
          }

          .honey-notification-subtitle {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.6);
            font-weight: 500;
          }

          .honey-notification-content {
            padding: 20px;
          }

          .honey-notification-message {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 20px;
          }

          .honey-notification-count {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            font-size: 32px;
            font-weight: 700;
            color: #ffc107;
            line-height: 1;
            text-shadow: 0 0 20px rgba(255, 193, 7, 0.2);
            padding: 12px;
            background: rgba(255, 193, 7, 0.1);
            border-radius: 12px;
            min-width: 80px;
          }

          .honey-notification-count-label {
            font-size: 12px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            letter-spacing: 0.5px;
          }

          .honey-notification-text {
            margin: 0;
            font-size: 15px;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.9);
          }

          .honey-notification-footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 16px;
          }

          .honey-notification-button {
            background: #ffc107;
            color: #000000;
            border: none;
            border-radius: 8px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
          }

          .honey-notification-button:hover {
            background: #ffca28;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(255, 193, 7, 0.4);
          }

          @keyframes slideIn {
            from {
              transform: translateX(100%) translateY(10%);
              opacity: 0;
            }
            to {
              transform: translateX(0) translateY(0);
              opacity: 1;
            }
          }

          @keyframes fadeOut {
            from {
              transform: translateX(0) translateY(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%) translateY(10%);
              opacity: 0;
            }
          }
        `;

        // Add click handlers
        const handleOpenExtension = () => {
          browser.runtime.sendMessage({ type: 'OPEN_EXTENSION' });
          if (document.body.contains(notificationDiv)) {
            document.body.removeChild(notificationDiv);
            document.head.removeChild(style);
          }
        };

        notificationDiv.addEventListener('click', handleOpenExtension);
        notificationDiv.querySelector('.honey-notification-button')?.addEventListener('click', (e) => {
          e.stopPropagation();
          handleOpenExtension();
        });

        // Add to DOM
        document.head.appendChild(style);
        document.body.appendChild(notificationDiv);

        // Remove after animation
        setTimeout(() => {
          if (document.body.contains(notificationDiv)) {
            document.body.removeChild(notificationDiv);
            document.head.removeChild(style);
          }
        }, 8000);
      }
    });
  },
});
