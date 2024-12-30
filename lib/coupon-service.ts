import { defineProxyService } from "@webext-core/proxy-service";
import type { ExtensionDatabase } from "./database";

export type CouponData = {
    code: string;
    description: string;
    title: string;
    website: string;
    domain: string;
    lastUpdated: number;
}

export interface CouponService {
    getAll(): Promise<CouponData[]>;
    getAllForDomain(domain: string): Promise<CouponData[]>;
    upsert(info: CouponData): Promise<void>;
}

function createCouponService(_db: Promise<ExtensionDatabase>): CouponService {
    return {
        async getAll() {
            const db = await _db;
            const results = await db.getAll("coupons");
            return results;
        },
        
        async getAllForDomain(domain: string) {
            const db = await _db;
            console.log(domain);
            
            const results = await db.getAllFromIndex('coupons', 'by-domain', domain);
            return results;
        },
        
        async upsert(info: CouponData) {
            const db = await _db;
            // Extract domain from website URL
            console.log(info);
            
      
            await db.put("coupons", info);
        },
    };
}   

export const [registerCouponService, getCouponService] = defineProxyService(
    "coupon-service",
    createCouponService
);