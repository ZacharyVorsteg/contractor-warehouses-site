// Configuration Example for warehousesforcontractors.com
// Copy this file and update the values for your deployment

window.CONFIG = {
    // Analytics & Tracking
    GTM_ID: 'GTM-XXXXXXX', // Replace with your Google Tag Manager ID
    GA4_ID: 'G-XXXXXXXXXX', // Replace with your Google Analytics 4 ID  
    FB_PIXEL_ID: 'XXXXXXXXX', // Replace with your Facebook Pixel ID
    
    // Dynamic Content
    AVAILABLE_UNITS: 7, // Number of available warehouse units
    
    // Call Tracking Numbers (for attribution)
    TRACKING_NUMBERS: {
        default: '561-718-6725',        // Default/direct traffic
        google_ads: '561-718-6726',     // Google Ads campaigns
        facebook: '561-718-6727',       // Facebook/Meta campaigns
        organic: '561-718-6728'         // Organic search traffic
    },
    
    // Lead Management
    CRM_WEBHOOK_URL: 'https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx/', // Zapier or CRM webhook
    BACKUP_EMAIL: 'leads@warehousesforcontractors.com', // Fallback email for leads
    
    // Site Configuration
    SITE_DOMAIN: 'warehousesforcontractors.com'
};

// Revenue tracking values (estimated lead values)
window.LEAD_VALUES = {
    small: 25000,   // Small warehouse leads
    medium: 35000,  // Medium warehouse leads  
    large: 50000    // Large warehouse leads
};

// Instructions for deployment:
// 1. Update all placeholder IDs with actual tracking codes
// 2. Set up call tracking numbers with your provider
// 3. Configure CRM webhook URL for lead capture
// 4. Update AVAILABLE_UNITS based on current inventory
// 5. Replace domain in sitemap.xml with actual domain
