/* ============================================================================
   TRIANGLE SOCIALS — SITE CONFIGURATION  (the one file to edit for details)
   ----------------------------------------------------------------------------
   • js/main.js reads this at page load and applies it across the whole page.
   • Leave a social / founder link as "" and it stays hidden. Nothing is invented.
   • The same email, WhatsApp number and VedicVox link are also written into
     index.html as a fallback for search engines and for visitors without
     JavaScript. If you ever change them, update this file AND search index.html
     for the old value (see README.md).
   ========================================================================== */

const SITE_CONFIG = {
  companyName: "Triangle Socials",

  email: "trianglesocials@gmail.com",

  /* WhatsApp: digits only, country code first, no "+" or spaces. */
  whatsappNumber: "919555905993",
  whatsappDisplay: "+91 9555905993",
  whatsappMessage: "Hi Triangle Socials, I would like to discuss your services.",

  /* Featured experience / case study */
  vedicVoxUrl: "https://www.youtube.com/@VedicVox",

  /* Founders. Add a profile URL only when you have a real one; the link icon
     then appears on that founder's card. */
  founders: [
    { name: "Vedant Tripathi", role: "Co-Founder", links: { instagram: "", linkedin: "" } },
    { name: "Harshit Tiwari", role: "Co-Founder", links: { instagram: "", linkedin: "" } }
  ],

  /* Triangle Socials' own social profiles: full https:// URLs.
     Empty ones are hidden automatically. (VedicVox is NOT one of these.) */
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    twitter: "",     // X / Twitter
    tiktok: ""
  },

  /* Analytics: off by default. Add an ID and it loads AFTER the page has finished
     loading (never blocks rendering). If you enable one, also allow its domain in
     the Content-Security-Policy in _headers (see the comment there). */
  analytics: {
    cloudflareToken: "",   // Cloudflare Web Analytics token
    ga4Id: "",             // Google Analytics 4, e.g. "G-XXXXXXXXXX"
    gtmId: ""              // Google Tag Manager, e.g. "GTM-XXXXXXX"
  }
};
