const API_URL = 'http://localhost:3001';


type Response = {
    message: string;
  store: string;
  coupons: CouponData[];
  error?: string;
  success: boolean;
}

type CouponData = {
    code: string;
    description: string;
    title: string;
    website: string;
    lastUpdated: number;
    domain: string
}

export const getCoupons = async (storeDN:string) : Promise<Response> => {
    const response = await fetch(`${API_URL}/api/coupons/${storeDN.replace(/^https?:\/\//, '').replace('www.', '')}`);
    return response.json();
}


export const getFavicon = async (storeDN:string)  => {
    const response = await fetch(`https://www.google.com/s2/favicons?domain=${storeDN.replace(/^https?:\/\//, '').replace('www.', '')}`);
    return response.text();
}

