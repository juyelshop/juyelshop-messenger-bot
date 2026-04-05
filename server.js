const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
app.use(express.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'juyelshop_verify_token';
const PORT = process.env.PORT || 3000;
const SITE_URL = 'https://juyelshop.com';

// ==================== WEBHOOK VERIFICATION ====================
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ Webhook verified!');
            return res.status(200).send(challenge);
        }
    }
    return res.sendStatus(403);
});

// ==================== WEBHOOK MESSAGE HANDLER ====================
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        for (const entry of body.entry) {
            const event = entry.messaging[0];
            const senderId = event.sender.id;

            if (event.message && event.message.text) {
                const userMessage = event.message.text.trim();
                console.log(`📩 Message from ${senderId}: ${userMessage}`);

                // Handle greetings
                if (isGreeting(userMessage)) {
                    await sendTextMessage(senderId, 
                        `আসসালামু আলাইকুম! 🌟\n\nJUYEL SHOP এ আপনাকে স্বাগতম!\n\nআপনি যেকোনো প্রোডাক্টের নাম লিখুন, আমি আপনাকে দাম, ছবি ও বিস্তারিত তথ্য জানিয়ে দিব।\n\nযেমন: bag, watch, shoes ইত্যাদি`
                    );
                } else {
                    // Search for product
                    await handleProductSearch(senderId, userMessage);
                }
            }
        }
        return res.status(200).send('EVENT_RECEIVED');
    }
    return res.sendStatus(404);
});

// ==================== GREETING CHECK ====================
function isGreeting(text) {
    const greetings = ['hi', 'hello', 'hey', 'হাই', 'হ্যালো', 'আসসালামু', 'সালাম', 'শুভ', 'নমস্কার', 'start', 'শুরু'];
    return greetings.some(g => text.toLowerCase().includes(g));
}

// ==================== PRODUCT SEARCH ====================
async function handleProductSearch(senderId, query) {
    try {
        // Send typing indicator
        await sendTypingOn(senderId);

        // Search products from website
        const products = await searchProducts(query);

        if (products.length === 0) {
            await sendTextMessage(senderId, 
                `😔 দুঃখিত! "${query}" নামে কোনো প্রোডাক্ট পাওয়া যায়নি।\n\nঅনুগ্রহ করে অন্য নামে খুঁজুন অথবা আমাদের ওয়েবসাইট ভিজিট করুন:\n${SITE_URL}`
            );
            return;
        }

        // Send first message
        await sendTextMessage(senderId, `🔍 "${query}" এর জন্য ${products.length}টি প্রোডাক্ট পাওয়া গেছে:`);

        // Send top products (max 5)
        const maxProducts = Math.min(products.length, 5);
        for (let i = 0; i < maxProducts; i++) {
            const product = products[i];
            
            // Get product details (description)
            let description = '';
            try {
                description = await getProductDescription(product.url);
            } catch (err) {
                console.log('Could not fetch description:', err.message);
            }

            // Send product image
            if (product.image) {
                await sendImageMessage(senderId, product.image);
            }

            // Send product info
            let infoText = `📦 ${product.name}\n💰 দাম: ${product.price}`;
            if (description) {
                // Limit description to 500 chars
                const shortDesc = description.length > 500 ? description.substring(0, 500) + '...' : description;
                infoText += `\n\n📝 বিবরণ:\n${shortDesc}`;
            }
            infoText += `\n\n🛒 অর্ডার করতে ভিজিট করুন:\n${product.url}`;

            await sendTextMessage(senderId, infoText);

            // Small delay between messages
            await delay(1000);
        }

        if (products.length > 5) {
            await sendTextMessage(senderId, 
                `আরো প্রোডাক্ট দেখতে আমাদের ওয়েবসাইট ভিজিট করুন:\n${SITE_URL}/products/search/${encodeURIComponent(query)}`
            );
        }

    } catch (error) {
        console.error('❌ Search error:', error.message);
        await sendTextMessage(senderId, 
            `দুঃখিত, কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা আমাদের ওয়েবসাইট ভিজিট করুন:\n${SITE_URL}`
        );
    }
}

// ==================== SCRAPE SEARCH RESULTS ====================
async function searchProducts(query) {
    const searchUrl = `${SITE_URL}/products/search/${encodeURIComponent(query)}`;
    console.log(`🔎 Searching: ${searchUrl}`);

    const response = await axios.get(searchUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const products = [];
    const seen = new Set();

    // Find all product links with product info
    $('a[href*="/product/"]').each((i, el) => {
        const url = $(el).attr('href');
        if (!url || seen.has(url)) return;

        // Find product name
        const nameEl = $(el).find('.product_name_link');
        if (!nameEl.length) return;

        const name = nameEl.text().trim();
        if (!name) return;

        seen.add(url);

        // Find image - look in parent card
        const card = $(el).closest('.col-lg-2, .col-md-3, .col-sm-4, .col-6, [class*="product"]');
        let image = '';
        const imgEl = card.find('img').first();
        if (imgEl.length) {
            image = imgEl.attr('src') || imgEl.attr('data-src') || '';
        }

        // Find price
        let price = '';
        const priceEl = card.find('.product_new_price').first();
        if (priceEl.length) {
            price = priceEl.text().trim();
        }

        if (name && price) {
            products.push({ name, price, image, url });
        }
    });

    console.log(`✅ Found ${products.length} products`);
    return products;
}

// ==================== SCRAPE PRODUCT DESCRIPTION ====================
async function getProductDescription(productUrl) {
    const response = await axios.get(productUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Find description in tab content
    let description = '';
    
    // Try tab-pane active content
    const tabContent = $('.tab-pane.show.active .single_product_tab_content').first();
    if (tabContent.length) {
        description = tabContent.text().trim();
    }

    // If not found, try the first tab pane
    if (!description) {
        const firstTab = $('.tab-pane').first().find('.single_product_tab_content');
        if (firstTab.length) {
            description = firstTab.text().trim();
        }
    }

    // Clean up description
    description = description.replace(/\s+/g, ' ').trim();

    return description;
}

// ==================== MESSENGER API FUNCTIONS ====================
async function sendTextMessage(recipientId, text) {
    // Facebook has 2000 char limit per message
    if (text.length > 2000) {
        text = text.substring(0, 1997) + '...';
    }

    try {
        await axios.post(
            `https://graph.facebook.com/v18.0/me/messages`,
            {
                recipient: { id: recipientId },
                message: { text: text }
            },
            {
                params: { access_token: PAGE_ACCESS_TOKEN },
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('❌ Send text error:', error.response?.data || error.message);
    }
}

async function sendImageMessage(recipientId, imageUrl) {
    try {
        await axios.post(
            `https://graph.facebook.com/v18.0/me/messages`,
            {
                recipient: { id: recipientId },
                message: {
                    attachment: {
                        type: 'image',
                        payload: {
                            url: imageUrl,
                            is_reusable: true
                        }
                    }
                }
            },
            {
                params: { access_token: PAGE_ACCESS_TOKEN },
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('❌ Send image error:', error.response?.data || error.message);
    }
}

async function sendTypingOn(recipientId) {
    try {
        await axios.post(
            `https://graph.facebook.com/v18.0/me/messages`,
            {
                recipient: { id: recipientId },
                sender_action: 'typing_on'
            },
            {
                params: { access_token: PAGE_ACCESS_TOKEN }
            }
        );
    } catch (error) {
        // Ignore typing indicator errors
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
    res.send('🤖 JUYEL SHOP Messenger Bot is running!');
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📌 Webhook URL: https://YOUR_DOMAIN/webhook`);
});
