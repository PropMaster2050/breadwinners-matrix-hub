-- Backfill missing Stage 1 commissions for existing network members
-- This ensures ALL uplines get their Stage 1 commission for each recruit

-- First, let's create a temp function to safely credit missing commissions
CREATE OR REPLACE FUNCTION public.backfill_stage1_commissions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recruit_record record;
  upline_record record;
  commission_amount numeric := 100;
  total_credited numeric := 0;
  users_processed integer := 0;
  commissions_added integer := 0;
BEGIN
  -- For each user in the network (except those without parents)
  FOR recruit_record IN 
    SELECT nt.user_id, nt.parent_id, p.created_at
    FROM public.network_tree nt
    JOIN public.profiles p ON p.user_id = nt.user_id
    WHERE nt.parent_id IS NOT NULL
    ORDER BY p.created_at ASC
  LOOP
    users_processed := users_processed + 1;
    
    -- For this recruit, traverse up their entire upline tree
    FOR upline_record IN
      WITH RECURSIVE upline_tree AS (
        -- Start with direct parent
        SELECT nt.user_id as upline_id, 1 as level
        FROM public.network_tree nt
        WHERE nt.user_id = recruit_record.parent_id
        
        UNION ALL
        
        -- Recursively get all uplines
        SELECT nt.parent_id as upline_id, ut.level + 1
        FROM public.network_tree nt
        JOIN upline_tree ut ON nt.user_id = ut.upline_id
        WHERE nt.parent_id IS NOT NULL
      )
      SELECT upline_id FROM upline_tree
    LOOP
      -- Check if commission already exists
      IF NOT EXISTS (
        SELECT 1 FROM public.commissions 
        WHERE upline_user_id = upline_record.upline_id 
          AND recruit_user_id = recruit_record.user_id 
          AND stage_number = 1
      ) THEN
        -- Create missing commission record
        INSERT INTO public.commissions (
          upline_user_id,
          recruit_user_id,
          stage_number,
          amount
        ) VALUES (
          upline_record.upline_id,
          recruit_record.user_id,
          1,
          commission_amount
        );
        
        -- Credit upline wallet immediately
        UPDATE public.wallets
        SET 
          e_wallet_balance = e_wallet_balance + commission_amount,
          total_earned = total_earned + commission_amount
        WHERE user_id = upline_record.upline_id;
        
        commissions_added := commissions_added + 1;
        total_credited := total_credited + commission_amount;
      END IF;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'users_processed', users_processed,
    'commissions_added', commissions_added,
    'total_amount_credited', total_credited
  );
END;
$function$;

-- Run the backfill
SELECT public.backfill_stage1_commissions();

-- Clean up the temporary function
DROP FUNCTION public.backfill_stage1_commissions();