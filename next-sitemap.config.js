/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://betterbusinessplanning.wealthcareportal.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,
  transform: async (config, path) => {
    if (path.includes("/api/") || path.includes("/_next/")) {
      return null;
    }

    if (path === "/") {
      return null;
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
  exclude: ["/"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "*" },
      { userAgent: "*", disallow: "/" },
      { userAgent: "*", disallow: "/api" },
    ],
    additionalSitemaps: ["https://betterbusinessplanningaccount.com/sitemap-0.xml", "https://betterbusinessplanningaccount.com/sitemap.xml"],
  },
};
