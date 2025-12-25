import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Create admin client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user's avatar from storage
    const { data: avatarFiles } = await supabaseAdmin.storage
      .from("avatars")
      .list(userId);
    
    if (avatarFiles && avatarFiles.length > 0) {
      const filesToDelete = avatarFiles.map(file => `${userId}/${file.name}`);
      await supabaseAdmin.storage.from("avatars").remove(filesToDelete);
    }

    // Delete all user's events (via sites)
    const { data: userSites } = await supabaseAdmin
      .from("sites")
      .select("id")
      .eq("user_id", userId);

    if (userSites && userSites.length > 0) {
      const siteIds = userSites.map(site => site.id);
      
      // Delete events for all user's sites
      await supabaseAdmin
        .from("events")
        .delete()
        .in("site_id", siteIds);

      // Delete funnels for all user's sites
      await supabaseAdmin
        .from("funnels")
        .delete()
        .in("site_id", siteIds);

      // Delete goals for all user's sites
      await supabaseAdmin
        .from("goals")
        .delete()
        .in("site_id", siteIds);

      // Delete all user's sites
      await supabaseAdmin
        .from("sites")
        .delete()
        .eq("user_id", userId);
    }

    // Delete user's profile
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    // Finally, delete the auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      return new Response(
        JSON.stringify({ error: "Failed to delete user account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in delete-account function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
