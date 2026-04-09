const axios = require('axios');
const ZohoToken = require('../models/ZohoToken');
const Product = require('../models/Product');
const Category = require('../models/Category'); // Fallback if needed, though we might not assign categories automatically yet
const Make = require('../models/Make'); // Fallback if needed

const ZOHO_BASE_URL = 'https://www.zohoapis.com/inventory/v1';
const ZOHO_AUTH_URL = 'https://accounts.zoho.com/oauth/v2/token';

const getAccessToken = async () => {
    let tokenData = await ZohoToken.findOne();

    if (tokenData && tokenData.expiresAt > new Date()) {
        return tokenData.accessToken;
    }

    try {
        console.log('Refreshing Zoho Access Token...');
        const params = new URLSearchParams();
        params.append('refresh_token', process.env.ZOHO_REFRESH_TOKEN);
        params.append('client_id', process.env.ZOHO_CLIENT_ID);
        params.append('client_secret', process.env.ZOHO_CLIENT_SECRET);
        params.append('grant_type', 'refresh_token');

        const response = await axios.post(ZOHO_AUTH_URL, params);

        const { access_token, expires_in } = response.data;

        if (!access_token) {
            console.error('Failed to refresh token:', response.data);
            throw new Error('Failed to obtain access token from Zoho');
        }

        const expiresAt = new Date(Date.now() + expires_in * 1000);

        if (tokenData) {
            tokenData.accessToken = access_token;
            tokenData.expiresAt = expiresAt;
            await tokenData.save();
        } else {
            console.log('Creating new ZohoToken record...'); // Should mostly be update if seeded, but handle create
            // If we are strictly using env for refresh token, we technically only need to store access token.
            // But we store refresh token in DB if we want to support changing it via UI later? 
            // For now, adhering to plan: "Store OAuth token securely."
            // If I relied *only* on ENV for refresh token, this is fine.
            tokenData = await ZohoToken.create({
                accessToken: access_token,
                refreshToken: process.env.ZOHO_REFRESH_TOKEN, // Assuming env is source of truth for initial setup
                expiresAt: expiresAt
            });
        }

        return access_token;
    } catch (error) {
        console.error('Error in getAccessToken:', error.response?.data || error.message);
        throw error;
    }
};

const fetchZohoItems = async (page = 1) => {
    const accessToken = await getAccessToken();
    const organizationId = process.env.ZOHO_ORG_ID;

    try {
        const response = await axios.get(`${ZOHO_BASE_URL}/items`, {
            params: {
                organization_id: organizationId,
                page: page,
                per_page: 200 // Maximize page size
            },
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching page ${page}:`, error.response?.data || error.message);
        throw error;
    }
};

const syncZohoItems = async () => {
    console.log(`[${new Date().toISOString()}] Starting Zoho Sync...`);
    let page = 1;
    let hasMore = true;
    let totalSynced = 0;
    let totalFailed = 0;

    // We need a default user for creating products if they don't exist
    // This is a placeholder. Realistically, we might need a specific system user.
    // For now, we will query the first admin user found? Or fail if required?
    // Product schema requires 'user'.
    const User = require('../models/User'); // Lazy load
    const adminUser = await User.findOne({ isAdmin: true });

    if (!adminUser) {
        console.error('No admin user found to assign products to.');
        return { success: false, message: 'No admin user found' };
    }

    // Also need default Category/Make if strict validation exists...
    // The current Product Model REQUIRES 'make' and 'category'.
    // We cannot easily map Zoho 'group_name' to our 'Category'/'Make' without a mapping table.
    // STRATEGY: Create/Use a "Uncategorized" Category and "Generic" Make for new items.

    let defaultCategory = await Category.findOne({ name: 'Uncategorized' });
    if (!defaultCategory) {
        // Try creating or finding any category
        defaultCategory = await Category.findOne({});
    }

    let defaultMake = await Make.findOne({ name: 'Generic' });
    if (!defaultMake) {
        defaultMake = await Make.findOne({});
    }

    if (!defaultCategory || !defaultMake) {
        console.warn('Warning: Missing default Category or Make. New items might fail validation.');
    }

    try {
        while (hasMore) {
            const data = await fetchZohoItems(page);
            const items = data.items;

            if (!items || items.length === 0) {
                hasMore = false;
                break;
            }

            for (const item of items) {
                try {
                    await updateLocalItem(item, adminUser, defaultCategory, defaultMake);
                    totalSynced++;
                } catch (err) {
                    console.error(`Failed to sync item ${item.item_id} (${item.name}):`, err.message);
                    totalFailed++;
                }
            }

            if (data.page_context && data.page_context.has_more_page) {
                page++;
            } else {
                hasMore = false;
            }
        }
        console.log(`[${new Date().toISOString()}] Zoho Sync Complete. Synced: ${totalSynced}, Failed: ${totalFailed}`);
        return { success: true, totalSynced, totalFailed };
    } catch (error) {
        console.error('Zoho Sync Critical Failure:', error);
        return { success: false, error: error.message };
    }
};

const updateLocalItem = async (zohoItem, adminUser, defaultCategory, defaultMake) => {
    // Determine stock
    // Rule: "Use primary location stock by default OR sum all location_available_stock values (configurable)"
    // We will sum available_stock from all locations provided in the item details?
    // The list API response structure typically includes minimal logic fields.
    // The requirement says "available_stock" is a root field usually, or derived.
    // "stock_on_hand" is common in Zoho. "available_stock" is explicitly requested.

    // Check if 'available_stock' is directly on the object (List API usually returns stock_on_hand)
    // If not present, we rely on what we have. 
    // Response details from Prompt says: 
    // "locations[] -> location_available_stock"

    // If locations is undefined (List API might not send it), we check for top level stock fields.
    // Assuming 'stock_on_hand' or 'available_stock' is present.
    // If necessary, we might need to fetch individual item details if list is insufficient, 
    // but standard Zoho List API sends 'stock_on_hand'.
    // The prompt explicitly lists 'locations[]' in the response structure section for Fetch Items API.

    let availableStock = 0;
    let actualAvailableStock = 0;

    // Logic: Sum all location_available_stock if 'locations' array exists
    // The Zoho API response for LIST might vary, but assuming format matches prompt:
    /*
      item: {
        ...
        locations: [ { location_available_stock: 10, ... } ]
      }
    */

    // NOTE: Zoho Inventory v1/items usually requires `?organization_id=...` and for stock details you might verify if it's included by default.
    // If the prompt says it is, we trust it.

    if (zohoItem.locations && Array.isArray(zohoItem.locations)) {
        availableStock = zohoItem.locations.reduce((sum, loc) => sum + (loc.location_available_stock || 0), 0);
        actualAvailableStock = zohoItem.locations.reduce((sum, loc) => sum + (loc.location_actual_available_stock || 0), 0);
    } else {
        // Fallback to root level stock if locations are missing in list view (common in some API versions)
        availableStock = zohoItem.stock_on_hand || zohoItem.available_stock || 0;
        actualAvailableStock = zohoItem.actual_available_stock || availableStock;
    }

    // Find product by zoho_item_id OR sku (to link existing)
    let product = await Product.findOne({ zoho_item_id: zohoItem.item_id });

    if (!product && zohoItem.sku) {
        // Try linking by SKU if not found by ID
        product = await Product.findOne({ sku: zohoItem.sku });
        if (product) {
            console.log(`Linking local product ${product.sku} to Zoho ID ${zohoItem.item_id}`);
            product.zoho_item_id = zohoItem.item_id;
        }
    }

    const updateData = {
        zoho_item_id: zohoItem.item_id,
        sku: zohoItem.sku,
        name: zohoItem.name, // Should we overwrite name? Requirements say "Update metadata". Yes.
        // price: zohoItem.rate, // Requirement doesn't explicitly force price sync, but it's "metadata". Let's sync it.
        // Actually, be careful with Price. It might disrupt specific pricing strategies.
        // "Update metadata and stock counts". "Local stock data is treated as read-only and overwritten".
        // It implies stock is the main target. Name/SKU/Rate are metadata.
        // Safety: Update Name, SKU, Stock, Rate.
        price: zohoItem.rate,
        countInStock: availableStock,
        actual_available_stock: actualAvailableStock,
        reorder_level: zohoItem.reorder_level,
        status: zohoItem.status,
        description: zohoItem.description || product?.description || 'No description', // Keep local if missing remote?
        group_id: zohoItem.group_id,
        group_name: zohoItem.group_name,
        last_zoho_modified_time: zohoItem.last_modified_time,
        last_synced_at: new Date()
    };

    if (product) {
        // Update
        Object.assign(product, updateData);
        await product.save();
    } else {
        // Create new
        // Requires mandate fields: user, image, category, make
        // We use placeholders if not linkable.

        // Image: Zoho *might* have image_name or image_document_id but getting the URL is a separate call usually.
        // We will set a placeholder image if creating from scratch.
        if (!defaultCategory || !defaultMake) {
            throw new Error('Cannot create new product: Missing default Category/Make configurations.');
        }

        await Product.create({
            ...updateData,
            user: adminUser._id,
            category: defaultCategory._id,
            make: defaultMake._id,
            image: '/images/placeholder.jpg', // Default placeholder
            images: [],
            // Slug will be auto-generated from name
        });
    }
};

module.exports = {
    syncZohoItems,
    fetchZohoItems // Export for testing/manual check
};
