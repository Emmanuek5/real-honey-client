import { registerCouponService } from "@/lib/coupon-service";
import { openExtensionDatabase } from "@/lib/database";
import { getCoupons } from "@/lib/functions";

const CHECKOUT_PATTERNS = [
  /\/cart/i,
  /\/basket/i,
  /\/checkout/i,
  /\/payment/i,
  /\/billing/i,
  /\/order/i,
  /cart/i,
  /basket/i,
  /checkout/i,
  /payment/i,
  /billing/i,
  /order/i
];

function isCheckoutPage(url: string): boolean {
  return CHECKOUT_PATTERNS.some(pattern => pattern.test(url));
}

export default defineBackground(() => {
  // Open database
  console.log('Hello background!', { id: browser.runtime.id });
  const db = openExtensionDatabase();

  // Initialize coupon service
  const couponService = registerCouponService(db);

  // Store coupons of websites you navigated to
  browser.tabs.onUpdated.addListener(async (id, changeInfo, tab) => {
    const url = tab.url ?? tab.pendingUrl;
    if (!url) return;
    if (url.startsWith('chrome://')) return;
    if (url.startsWith('about:')) return;
    if (url.startsWith('chrome-extension:')) return;

    if (changeInfo.status === 'complete' && tab.url) {
      if (isCheckoutPage(tab.url)) {
        const hostname = new URL(tab.url).hostname;
        await checkForCoupons(id, hostname);
      } else {
        try {
          // Get hostname and fetch coupons
          const hostname = new URL(url).hostname;
          console.log(`Fetching coupons for ${hostname}`);
          //remove www
          const response = await getCoupons(hostname.replace('www.', ''));

          if (response.success && response.coupons) {
            console.log(`Found ${response.coupons.length} coupons for ${hostname}`);
            for (const coupon of response.coupons) {
              coupon.domain = hostname;
              await couponService.upsert(coupon);
            }
          }
        } catch (error) {
          console.error('Error handling coupons:', error);
        }
      }
    }
  });

  // Check for coupons and show notification
  async function checkForCoupons(tabId: number, hostname: string) {
    try {
      const coupons = await couponService.getAllForDomain(hostname);
      
      if (coupons && coupons.length > 0) {
        // Send notification with coupons
        browser.tabs.sendMessage(tabId, {
          type: 'SHOW_COUPON_NOTIFICATION',
          couponsCount: coupons.length,
          coupons: coupons
        });
      }
    } catch (error) {
      console.error('Error checking for coupons:', error);
    }
  }

  // Listen for messages from content script
  browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === 'OPEN_EXTENSION') {
    browser.action.openPopup();
    }
    if (message.type === 'GET_CURRENT_DOMAIN') {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const url = tabs[0]?.url;
      if (!url) return { success: false, error: 'No active tab found' };
      
      const hostname = new URL(url).hostname;
      return { success: true, domain: hostname };
    }
    return false;
  });
});
