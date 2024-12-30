import { DBSchema, IDBPDatabase, openDB } from "idb";

type CouponData = {
    code: string;
    description: string;
    title: string;
    website: string;
    domain: string;  // Added domain field
    lastUpdated: number;
}

interface ExtensionDatabaseSchema extends DBSchema {
    coupons: {
        // Using compound key of domain + code
        key: [string, string];  // [domain, code]
        value: CouponData;
        indexes: {
            'by-domain': string;  // Index to query by domain
        };
    };
}

export type ExtensionDatabase = IDBPDatabase<ExtensionDatabaseSchema>;

export function openExtensionDatabase(): Promise<ExtensionDatabase> {
    return openDB<ExtensionDatabaseSchema>("realhoney", 2, {
        upgrade(database, oldVersion) {
            // If old store exists, delete it
            if (oldVersion < 2 && database.objectStoreNames.contains("coupons")) {
                database.deleteObjectStore("coupons");
            }
            
            // Create new store with compound key
            const store = database.createObjectStore("coupons", {
                keyPath: ['domain', 'code']
            });
            
            // Create index for querying by domain
            store.createIndex('by-domain', 'domain');
        },
    });
}