const FEEDS = [
    'https://fuelcellsworks.com/feed/',
    'https://cleantechnica.com/category/clean-transport/hydrogen/feed/',
    'https://www.renewableenergyworld.com/category/hydrogen/feed/'
];

async function run() {
    let allItems = [];
    for (const feed of FEEDS) {
        const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`;
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok' && data.items) {
                    allItems = allItems.concat(data.items);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
    
    console.log(`Fetched ${allItems.length} items`);
    
    for (let i = 0; i < Math.min(10, allItems.length); i++) {
        const item = allItems[i];
        let realImage = '';
        if (item.enclosure && item.enclosure.link) {
            realImage = item.enclosure.link;
        } else if (item.thumbnail && item.thumbnail !== "") {
            realImage = item.thumbnail;
        } else {
            const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/i);
            if (imgMatch && imgMatch[1]) {
                realImage = imgMatch[1];
            }
        }
        console.log(`Title: ${item.title.substring(0, 30)}... | Image: ${realImage}`);
    }
}
run();
