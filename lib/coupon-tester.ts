import { CouponData } from "./coupon-service";

export interface CouponTestResult {
    coupon: CouponData;
    success: boolean;
    savings?: number;
}

export async function fillCouponCode(code: string): Promise<void> {
    // Common coupon input selectors
    const selectors = [
        'input[name*="coupon" i]',
        'input[id*="coupon" i]',
        'input[placeholder*="coupon" i]',
        'input[name*="discount" i]',
        'input[id*="discount" i]',
        'input[placeholder*="discount" i]',
        'input[name*="promo" i]',
        'input[id*="promo" i]',
        'input[placeholder*="promo" i]'
    ];

    // Find the coupon input
    let couponInput: HTMLInputElement | null = null;
    for (const selector of selectors) {
        couponInput = document.querySelector(selector);
        if (couponInput) break;
    }

    if (!couponInput) {
        throw new Error('Could not find coupon input field');
    }

    // Fill the coupon code
    couponInput.value = code;
    couponInput.dispatchEvent(new Event('input', { bubbles: true }));
    couponInput.dispatchEvent(new Event('change', { bubbles: true }));

    // Find and click the apply button
    const applyButtonSelectors = [
        'button[type="submit"]',
        'button:contains("Apply")',
        'button:contains("Submit")',
        'button:contains("Verify")',
        'input[type="submit"]'
    ];

    let applyButton: HTMLElement | null = null;
    for (const selector of applyButtonSelectors) {
        applyButton = document.querySelector(selector);
        if (applyButton) break;
    }

    if (!applyButton) {
        throw new Error('Could not find apply button');
    }

    applyButton.click();
}

export async function checkCouponSuccess(): Promise<boolean> {
    // Wait for potential error messages or success indicators
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for common error messages
    const errorSelectors = [
        '[class*="error" i]',
        '[class*="invalid" i]',
        '[id*="error" i]',
        '[id*="invalid" i]'
    ];

    for (const selector of errorSelectors) {
        const errorElement = document.querySelector(selector);
        if (errorElement && errorElement.textContent?.toLowerCase().includes('invalid')) {
            return false;
        }
    }

    // Check for success indicators
    const successSelectors = [
        '[class*="success" i]',
        '[class*="valid" i]',
        '[id*="success" i]',
        '[id*="valid" i]'
    ];

    for (const selector of successSelectors) {
        const successElement = document.querySelector(selector);
        if (successElement && successElement.textContent?.toLowerCase().includes('applied')) {
            return true;
        }
    }

    // Check if total price changed
    const priceSelectors = [
        '[class*="total" i]',
        '[class*="price" i]',
        '[class*="amount" i]'
    ];

    let totalElement: Element | null = null;
    for (const selector of priceSelectors) {
        totalElement = document.querySelector(selector);
        if (totalElement) break;
    }

    if (totalElement) {
        const priceText = totalElement.textContent;
        if (priceText) {
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            return !isNaN(price);
        }
    }

    return false;
}

export async function testCoupon(coupon: CouponData): Promise<CouponTestResult> {
    try {
        await fillCouponCode(coupon.code);
        const success = await checkCouponSuccess();
        
        return {
            coupon,
            success,
            // We could potentially calculate savings here
            savings: success ? 0 : undefined
        };
    } catch (error) {
        console.error('Error testing coupon:', error);
        return {
            coupon,
            success: false
        };
    }
}
