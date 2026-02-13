// utils/cors.js
export function corsMiddleware(req, res) {
  const allowedOrigins = [
    "https://javierclt.github.io",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://mindmap-frontend-rho.vercel.app",
    "https://mind-map-maker.com",
    "https://www.mind-map-maker.com",
  ];
  
  const origin = req.headers.origin;
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (
    allowedOrigins.includes(origin) ||
    (typeof origin === "string" && origin.endsWith(".vercel.app"))
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  }
  
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}
