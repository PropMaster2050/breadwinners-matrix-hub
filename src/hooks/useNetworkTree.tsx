import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NetworkMember {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  current_stage: number;
  joined_at: string;
  downlines: NetworkMember[];
  commission_earned?: number;
  stage_completed?: number;
}

export interface StageData {
  stage_number: number;
  per_recruit_amount: number;
  total_recruits: number;
  completed_recruits: number;
  total_earned: number;
  incentive?: string;
  is_complete: boolean;
}

export const useNetworkTree = (stageNumber: number) => {
  const { user } = useAuth();
  const [networkTree, setNetworkTree] = useState<NetworkMember[]>([]);
  const [stageData, setStageData] = useState<StageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNetworkTree = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch ALL 6 direct recruits from network_tree
      const { data: directRecruits, error: networkError } = await supabase
        .from('network_tree')
        .select(`
          user_id,
          created_at,
          profiles!inner(
            user_id,
            full_name,
            username,
            avatar_url,
            current_stage,
            created_at
          )
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

      if (networkError) {
        console.error('Network tree fetch error:', networkError);
        throw networkError;
      }

      console.log('Direct recruits found:', directRecruits?.length || 0);

      // For each direct recruit, fetch their commission data
      const treeWithDownlines = await Promise.all(
        (directRecruits || []).map(async (recruit: any) => {
          // Fetch stage completion data
          const { data: completions } = await supabase
            .from('stage_completions')
            .select('stage_number, completed_at')
            .eq('user_id', recruit.user_id)
            .order('stage_number', { ascending: false })
            .limit(1);

          // Fetch commission data for this recruit
          const { data: commission } = await supabase
            .from('commissions')
            .select('amount, stage_number, created_at')
            .eq('upline_user_id', user.id)
            .eq('recruit_user_id', recruit.user_id)
            .eq('stage_number', stageNumber)
            .maybeSingle();

          console.log('Commission for recruit', recruit.profiles.username, ':', commission);

          return {
            id: recruit.user_id,
            user_id: recruit.user_id,
            full_name: recruit.profiles.full_name,
            username: recruit.profiles.username,
            avatar_url: recruit.profiles.avatar_url,
            current_stage: recruit.profiles.current_stage,
            joined_at: recruit.profiles.created_at,
            stage_completed: completions?.[0]?.stage_number || 0,
            commission_earned: commission?.amount || 0,
            downlines: [] // Removed grandchildren for 6-person direct model
          };
        })
      );

      // Filter based on stage view
      let filteredTree = treeWithDownlines;
      if (stageNumber > 1) {
        // For stages 2-6, only show recruits who completed the previous stage
        filteredTree = treeWithDownlines.filter(
          (member: any) => member.stage_completed >= (stageNumber - 1)
        );
      }

      setNetworkTree(filteredTree);

      // Calculate stage-specific data
      await calculateStageData(filteredTree, stageNumber);
    } catch (error) {
      console.error('Error fetching network tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStageData = async (tree: any[], stage: number) => {
    const commissionAmounts = {
      1: 100,
      2: 200,
      3: 250,
      4: 1000,
      5: 1500,
      6: 2000
    };

    const incentives = {
      2: "Samsung Smartphone",
      3: "R10,000 Voucher",
      4: "R25,000 Voucher",
      5: "R50,000 Voucher",
      6: "R150,000 Voucher"
    };

    const perRecruitAmount = commissionAmounts[stage as keyof typeof commissionAmounts];
    
    // Count total and completed recruits
    let totalRecruits = 0;
    let completedRecruits = 0;

    if (stage === 1) {
      // Stage 1: count all direct recruits (up to 6)
      totalRecruits = tree.length;
      completedRecruits = totalRecruits;
    } else {
      // Stages 2-6: count only those who completed previous stage
      completedRecruits = tree.filter(
        (m: any) => m.stage_completed >= (stage - 1)
      ).length;
      totalRecruits = completedRecruits;
    }

    const totalEarned = completedRecruits * perRecruitAmount;
    const isComplete = completedRecruits >= 6;

    setStageData({
      stage_number: stage,
      per_recruit_amount: perRecruitAmount,
      total_recruits: totalRecruits,
      completed_recruits: completedRecruits,
      total_earned: totalEarned,
      incentive: isComplete ? incentives[stage as keyof typeof incentives] : undefined,
      is_complete: isComplete
    });
  };

  useEffect(() => {
    fetchNetworkTree();

    // Set up real-time subscriptions
    const stageChannel = supabase
      .channel('stage-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stage_completions'
        },
        () => {
          fetchNetworkTree();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commissions'
        },
        () => {
          fetchNetworkTree();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stageChannel);
    };
  }, [user?.id, stageNumber]);

  return { networkTree, stageData, loading, refetch: fetchNetworkTree };
};
