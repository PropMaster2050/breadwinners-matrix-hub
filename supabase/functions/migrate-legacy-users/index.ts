import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LegacyUser {
  id: string;
  memberId: string;
  fullName: string;
  username: string;
  password: string;
  mobile: string;
  email?: string;
  level: number;
  stage: number;
  earnings: number;
  directRecruits: number;
  totalRecruits: number;
  joinDate: string;
  wallets: {
    eWallet: number;
    registrationWallet: number;
    incentiveWallet: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { users } = await req.json();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const user of users as LegacyUser[]) {
      try {
        // Check if user already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('username', user.username)
          .maybeSingle();

        if (existingProfile) {
          results.errors.push(`${user.username}: Already exists`);
          results.failed++;
          continue;
        }

        // Ensure auth user exists or create one
        const tempEmail = user.email || `${user.username}@breadwinners.local`;
        let authUserId = '';
        let createdNew = false;

        // Try to find existing auth user by email to avoid duplicates on reruns
        const { data: listed } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existingAuth = listed?.users?.find((u: any) => (u.email || '').toLowerCase() === tempEmail.toLowerCase());

        if (existingAuth) {
          authUserId = existingAuth.id;
        } else {
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: tempEmail,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              full_name: user.fullName,
              username: user.username,
              phone: user.mobile,
              own_referral_code: user.memberId
            }
          });

          if (authError || !authData.user) {
            results.errors.push(`${user.username}: ${authError?.message || 'Auth failed'}`);
            results.failed++;
            continue;
          }

          authUserId = authData.user.id;
          createdNew = true;
        }

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: authUserId,
            full_name: user.fullName,
            username: user.username,
            email: tempEmail,
            phone: user.mobile,
            id_number: '',
            own_referral_code: user.memberId,
            direct_recruits: user.directRecruits,
            total_recruits: user.totalRecruits
          });

        if (profileError) {
          // Rollback newly created auth user to avoid orphans
          if (createdNew && authUserId) {
            await supabaseAdmin.auth.admin.deleteUser(authUserId);
          }
          results.errors.push(`${user.username}: ${profileError.message}`);
          results.failed++;
          continue;
        }

        // Create wallet
        const { error: walletError } = await supabaseAdmin
          .from('wallets')
          .insert({
            user_id: authUserId,
            e_wallet_balance: user.wallets.eWallet,
            registration_wallet_balance: user.wallets.registrationWallet,
            incentive_wallet_balance: user.wallets.incentiveWallet,
            total_earned: user.earnings
          });

        if (walletError) {
          results.errors.push(`${user.username}: ${walletError.message}`);
          results.failed++;
          continue;
        }

        // Create network tree
        await supabaseAdmin
          .from('network_tree')
          .insert({
            user_id: authUserId,
            level: user.level,
            stage: user.stage,
            parent_id: null
          });

        results.success++;
      } catch (error: any) {
        results.errors.push(`${user.username}: ${error.message}`);
        results.failed++;
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
