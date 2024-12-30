import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest:{
    name:"RealHoney",
    description: " The Best way to get coupons",
    version: "1.0",
    icons: {
      16: "/icon/16.png",
      32: "/icon/32.png",
      48: "/icon/48.png",
      96: "/icon/96.png",
      128: "/icon/128.png",
    },
    permissions: ["tabs", "storage","activeTab"],
    host_permissions: ["<all_urls>"],
    action: {
      default_popup: "entrypoints/popup/index.html",
      default_icon: "icon/icon.png",
      default_title: "RealHoney",
    },
  },
  
  runner:{
    startUrls:["https://amazon.com/"],
  },
  modules: ['@wxt-dev/module-react'],
});
