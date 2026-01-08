# ThriftySouq MCP Server

This MCP (Model Context Protocol) server allows AI agents to fully control and manage the ThriftySouq e-commerce site.

## Setup

1. Install dependencies:
```bash
cd mcp-server
npm install
```

2. Set environment variables:
```bash
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_KEY="your-supabase-service-key"
```

3. Run the server:
```bash
npm start
```

## Available Tools

### Products
- `list_products` - List all products with filtering options
- `get_product` - Get a single product by ID or slug
- `create_product` - Create a new product
- `update_product` - Update an existing product
- `delete_product` - Delete a product
- `update_stock` - Update product stock quantity

### Categories
- `list_categories` - List all categories
- `create_category` - Create a new category
- `update_category` - Update a category
- `delete_category` - Delete a category

### Orders
- `list_orders` - List orders with filtering
- `get_order` - Get order details with items
- `update_order_status` - Update order status (pending/processing/shipped/delivered/cancelled)
- `update_payment_status` - Update payment status (pending/paid/failed/refunded)
- `add_order_note` - Add a note to an order

### Customers
- `list_customers` - List all customers
- `get_customer` - Get customer details with order history

### Reviews
- `list_reviews` - List reviews with filtering
- `approve_review` - Approve or unapprove a review
- `respond_to_review` - Add admin response to a review
- `delete_review` - Delete a review

### Coupons
- `list_coupons` - List all coupons
- `create_coupon` - Create a new coupon
- `update_coupon` - Update a coupon
- `delete_coupon` - Delete a coupon

### Currencies
- `list_currencies` - List all currencies
- `create_currency` - Create a new currency
- `update_currency` - Update a currency
- `delete_currency` - Delete a currency

### Store Settings
- `get_store_settings` - Get store settings
- `update_store_settings` - Update store settings

### Hero Section
- `get_hero_settings` - Get hero section settings
- `update_hero_settings` - Update hero section settings

### Footer
- `list_footer_sections` - List footer sections and links
- `create_footer_section` - Create a footer section
- `create_footer_link` - Create a footer link
- `update_footer_link` - Update a footer link
- `delete_footer_link` - Delete a footer link

### Analytics & Reports
- `get_dashboard_stats` - Get dashboard statistics
- `get_sales_report` - Get sales report for a date range
- `get_top_products` - Get top selling/rated products
- `get_low_stock_products` - Get products with low stock

### Payment Methods
- `list_payment_methods` - List all payment methods
- `create_payment_method` - Create a payment method
- `update_payment_method` - Update a payment method
- `delete_payment_method` - Delete a payment method

### Admin Users
- `list_admin_users` - List all admin users
- `create_admin_user` - Create a new admin user
- `update_admin_user` - Update an admin user
- `delete_admin_user` - Delete an admin user

## Example Usage

### List all products
```json
{
  "name": "list_products",
  "arguments": {
    "is_active": true,
    "limit": 10
  }
}
```

### Create a product
```json
{
  "name": "create_product",
  "arguments": {
    "name": "Premium Leather Bag",
    "description": "Handcrafted genuine leather bag",
    "category_id": "uuid-here",
    "base_price": 149.99,
    "sku": "BAG-001",
    "stock_quantity": 50,
    "images": ["https://example.com/bag.jpg"],
    "is_featured": true
  }
}
```

### Update order status
```json
{
  "name": "update_order_status",
  "arguments": {
    "id": "order-uuid",
    "status": "shipped"
  }
}
```

### Get dashboard stats
```json
{
  "name": "get_dashboard_stats",
  "arguments": {}
}
```

## Configuration

Add to your `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "thriftysouq": {
      "command": "node",
      "args": ["mcp-server/index.js"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_SERVICE_KEY": "your-service-key"
      }
    }
  }
}
```
