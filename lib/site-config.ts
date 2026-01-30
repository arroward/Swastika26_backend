export const SITE_CONFIG = {
    name: "Swastika '26",
    domain: "swastika.live",
    baseUrl: "https://swastika.live",
    supportEmail: "swastika26@mbcpeermade.com",
    links: {
        schedule: "https://swastika.live/schedule",
        tickets: "https://swastika.live/tickets",
        guidelines: "https://swastika.live/guidelines",
        wallet: (purchaseId: string) => `https://swastika.live/wallet/${purchaseId}`,
        ticket: (ticketId: string) => `https://swastika.live/ticket/${ticketId}`,
    },
    event: {
        dates: "Feb 20-21, 2026",
        location: "MBCCET Peermade",
        college: "Mar Baselios Christian College of Engineering & Technology",
    },
    socials: {
        instagram: "https://instagram.com/swastika_2k26",
    }
};
