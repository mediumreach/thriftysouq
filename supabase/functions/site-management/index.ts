import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RequestBody {
  action: string;
  resource: string;
  data?: Record<string, unknown>;
  id?: string;
  filters?: Record<string, unknown>;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

async function handleProducts(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: products, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return { success: true, data: products };
    }
    case "get": {
      if (!id) throw new Error("Product ID required");
      const { data: product, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return { success: true, data: product };
    }
    case "create": {
      if (!data) throw new Error("Product data required");
      const { data: product, error } = await supabase
        .from("products")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: product };
    }
    case "update": {
      if (!id) throw new Error("Product ID required");
      if (!data) throw new Error("Update data required");
      const { data: product, error } = await supabase
        .from("products")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: product };
    }
    case "delete": {
      if (!id) throw new Error("Product ID required");
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      return { success: true, message: "Product deleted" };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleCategories(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: categories, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return { success: true, data: categories };
    }
    case "create": {
      if (!data) throw new Error("Category data required");
      const { data: category, error } = await supabase
        .from("categories")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: category };
    }
    case "update": {
      if (!id) throw new Error("Category ID required");
      const { data: category, error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: category };
    }
    case "delete": {
      if (!id) throw new Error("Category ID required");
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      return { success: true, message: "Category deleted" };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleOrders(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, image_url))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return { success: true, data: orders };
    }
    case "get": {
      if (!id) throw new Error("Order ID required");
      const { data: order, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, image_url))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return { success: true, data: order };
    }
    case "update_status": {
      if (!id) throw new Error("Order ID required");
      if (!data?.status) throw new Error("Status required");
      const { data: order, error } = await supabase
        .from("orders")
        .update({ status: data.status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: order };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleReviews(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("*, products(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return { success: true, data: reviews };
    }
    case "approve": {
      if (!id) throw new Error("Review ID required");
      const { data: review, error } = await supabase
        .from("reviews")
        .update({ is_approved: true })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: review };
    }
    case "reject": {
      if (!id) throw new Error("Review ID required");
      const { data: review, error } = await supabase
        .from("reviews")
        .update({ is_approved: false })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: review };
    }
    case "delete": {
      if (!id) throw new Error("Review ID required");
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      return { success: true, message: "Review deleted" };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleCoupons(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: coupons, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return { success: true, data: coupons };
    }
    case "create": {
      if (!data) throw new Error("Coupon data required");
      const { data: coupon, error } = await supabase
        .from("coupons")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: coupon };
    }
    case "update": {
      if (!id) throw new Error("Coupon ID required");
      const { data: coupon, error } = await supabase
        .from("coupons")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: coupon };
    }
    case "delete": {
      if (!id) throw new Error("Coupon ID required");
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      return { success: true, message: "Coupon deleted" };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleCurrencies(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: currencies, error } = await supabase
        .from("currencies")
        .select("*")
        .order("code");
      if (error) throw error;
      return { success: true, data: currencies };
    }
    case "create": {
      if (!data) throw new Error("Currency data required");
      const { data: currency, error } = await supabase
        .from("currencies")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: currency };
    }
    case "update": {
      if (!id) throw new Error("Currency ID required");
      const { data: currency, error } = await supabase
        .from("currencies")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: currency };
    }
    case "delete": {
      if (!id) throw new Error("Currency ID required");
      const { error } = await supabase.from("currencies").delete().eq("id", id);
      if (error) throw error;
      return { success: true, message: "Currency deleted" };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleHeroSettings(action: string, data?: Record<string, unknown>) {
  switch (action) {
    case "get": {
      const { data: settings, error } = await supabase
        .from("hero_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return { success: true, data: settings };
    }
    case "update": {
      if (!data) throw new Error("Settings data required");
      const { data: existing } = await supabase
        .from("hero_settings")
        .select("id")
        .maybeSingle();
      
      let result;
      if (existing) {
        const { data: settings, error } = await supabase
          .from("hero_settings")
          .update(data)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        result = settings;
      } else {
        const { data: settings, error } = await supabase
          .from("hero_settings")
          .insert([data])
          .select()
          .single();
        if (error) throw error;
        result = settings;
      }
      return { success: true, data: result };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleFooterSections(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: sections, error } = await supabase
        .from("footer_sections")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return { success: true, data: sections };
    }
    case "create": {
      if (!data) throw new Error("Section data required");
      const { data: section, error } = await supabase
        .from("footer_sections")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: section };
    }
    case "update": {
      if (!id) throw new Error("Section ID required");
      const { data: section, error } = await supabase
        .from("footer_sections")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: section };
    }
    case "delete": {
      if (!id) throw new Error("Section ID required");
      const { error } = await supabase.from("footer_sections").delete().eq("id", id);
      if (error) throw error;
      return { success: true, message: "Section deleted" };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleFooterLinks(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: links, error } = await supabase
        .from("footer_links")
        .select("*, footer_sections(title)")
        .order("display_order");
      if (error) throw error;
      return { success: true, data: links };
    }
    case "create": {
      if (!data) throw new Error("Link data required");
      const { data: link, error } = await supabase
        .from("footer_links")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: link };
    }
    case "update": {
      if (!id) throw new Error("Link ID required");
      const { data: link, error } = await supabase
        .from("footer_links")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: link };
    }
    case "delete": {
      if (!id) throw new Error("Link ID required");
      const { error } = await supabase.from("footer_links").delete().eq("id", id);
      if (error) throw error;
      return { success: true, message: "Link deleted" };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleSettings(action: string, data?: Record<string, unknown>) {
  switch (action) {
    case "get": {
      const { data: settings, error } = await supabase
        .from("site_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return { success: true, data: settings };
    }
    case "update": {
      if (!data) throw new Error("Settings data required");
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .maybeSingle();
      
      let result;
      if (existing) {
        const { data: settings, error } = await supabase
          .from("site_settings")
          .update(data)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        result = settings;
      } else {
        const { data: settings, error } = await supabase
          .from("site_settings")
          .insert([data])
          .select()
          .single();
        if (error) throw error;
        result = settings;
      }
      return { success: true, data: result };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleWebhooks(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: webhooks, error } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return { success: true, data: webhooks };
    }
    case "create": {
      if (!data) throw new Error("Webhook data required");
      const { data: webhook, error } = await supabase
        .from("webhooks")
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: webhook };
    }
    case "update": {
      if (!id) throw new Error("Webhook ID required");
      const { data: webhook, error } = await supabase
        .from("webhooks")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: webhook };
    }
    case "delete": {
      if (!id) throw new Error("Webhook ID required");
      const { error } = await supabase.from("webhooks").delete().eq("id", id);
      if (error) throw error;
      return { success: true, message: "Webhook deleted" };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handlePaymentMethods(action: string, data?: Record<string, unknown>, id?: string) {
  switch (action) {
    case "list": {
      const { data: methods, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("name");
      if (error) throw error;
      return { success: true, data: methods };
    }
    case "update": {
      if (!id) throw new Error("Payment method ID required");
      const { data: method, error } = await supabase
        .from("payment_methods")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data: method };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleDashboard() {
  const [products, orders, reviews, coupons] = await Promise.all([
    supabase.from("products").select("id", { count: "exact" }),
    supabase.from("orders").select("id, total, status"),
    supabase.from("reviews").select("id, is_approved"),
    supabase.from("coupons").select("id, is_active"),
  ]);

  const totalRevenue = orders.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
  const pendingOrders = orders.data?.filter(o => o.status === "pending").length || 0;
  const pendingReviews = reviews.data?.filter(r => !r.is_approved).length || 0;
  const activeCoupons = coupons.data?.filter(c => c.is_active).length || 0;

  return {
    success: true,
    data: {
      totalProducts: products.count || 0,
      totalOrders: orders.data?.length || 0,
      totalRevenue,
      pendingOrders,
      totalReviews: reviews.data?.length || 0,
      pendingReviews,
      totalCoupons: coupons.data?.length || 0,
      activeCoupons,
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method === "GET") {
      return jsonResponse({
        success: true,
        message: "ThriftySouq Site Management API",
        version: "1.0.0",
        resources: [
          "products", "categories", "orders", "reviews", "coupons",
          "currencies", "hero_settings", "footer_sections", "footer_links",
          "settings", "webhooks", "payment_methods", "dashboard"
        ],
        actions: {
          products: ["list", "get", "create", "update", "delete"],
          categories: ["list", "create", "update", "delete"],
          orders: ["list", "get", "update_status"],
          reviews: ["list", "approve", "reject", "delete"],
          coupons: ["list", "create", "update", "delete"],
          currencies: ["list", "create", "update", "delete"],
          hero_settings: ["get", "update"],
          footer_sections: ["list", "create", "update", "delete"],
          footer_links: ["list", "create", "update", "delete"],
          settings: ["get", "update"],
          webhooks: ["list", "create", "update", "delete"],
          payment_methods: ["list", "update"],
          dashboard: ["get"],
        },
      });
    }

    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    const body: RequestBody = await req.json();
    const { action, resource, data, id } = body;

    if (!action || !resource) {
      return errorResponse("Action and resource are required");
    }

    let result;
    switch (resource) {
      case "products":
        result = await handleProducts(action, data, id);
        break;
      case "categories":
        result = await handleCategories(action, data, id);
        break;
      case "orders":
        result = await handleOrders(action, data, id);
        break;
      case "reviews":
        result = await handleReviews(action, data, id);
        break;
      case "coupons":
        result = await handleCoupons(action, data, id);
        break;
      case "currencies":
        result = await handleCurrencies(action, data, id);
        break;
      case "hero_settings":
        result = await handleHeroSettings(action, data);
        break;
      case "footer_sections":
        result = await handleFooterSections(action, data, id);
        break;
      case "footer_links":
        result = await handleFooterLinks(action, data, id);
        break;
      case "settings":
        result = await handleSettings(action, data);
        break;
      case "webhooks":
        result = await handleWebhooks(action, data, id);
        break;
      case "payment_methods":
        result = await handlePaymentMethods(action, data, id);
        break;
      case "dashboard":
        result = await handleDashboard();
        break;
      default:
        return errorResponse(`Unknown resource: ${resource}`);
    }

    return jsonResponse(result);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
});
