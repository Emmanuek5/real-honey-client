import { showNotification } from './CouponNotification';

export default defineUnlistedScript(()=>{
  // Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'SHOW_COUPON_NOTIFICATION') {
    showNotification(message.couponsCount, message.coupons);
  }
});

})