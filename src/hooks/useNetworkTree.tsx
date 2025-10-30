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
  is_locked?: boolean; // Locked if hasn't completed previous stage
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
      // Fetch direct links from network_tree (no embedded join to avoid RLS join issues)
      const { data: directLinks, error: networkError } = await supabase
        .from('network_tree')
        .select('user_id, created_at, parent_id')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

      if (networkError) {
        console.error('Network tree fetch error:', networkError);
        throw networkError;
      }

      const directIds = (directLinks || []).map((r: any) => r.user_id);

      // Fetch profiles for direct recruits
      let directProfiles: any[] = [];
      if (directIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url, current_stage, created_at')
          .in('user_id', directIds);
        if (profilesError) {
          console.error('Profiles fetch error:', profilesError);
          throw profilesError;
        }
        directProfiles = profilesData || [];
      }

      const profileById = new Map(directProfiles.map((p: any) => [p.user_id, p]));

      // Build tree with downlines
      const treeWithDownlines = await Promise.all(
        (directLinks || []).map(async (recruit: any) => {
          const profile = profileById.get(recruit.user_id);

          // Fetch stage completion data
          const { data: completions } = await supabase
            .from('stage_completions')
            .select('stage_number, completed_at')
            .eq('user_id', recruit.user_id)
            .order('stage_number', { ascending: false })
            .limit(1);

          const highestStageCompleted = completions?.[0]?.stage_number || 0;
          
          // Check if this recruit is "locked" for current stage view
          // Locked if they haven't completed the previous stage
          const isLocked = stageNumber > 1 && highestStageCompleted < (stageNumber - 1);

          // Fetch commission data for this recruit
          const { data: commission } = await supabase
            .from('commissions')
            .select('amount, stage_number, created_at')
            .eq('upline_user_id', user.id)
            .eq('recruit_user_id', recruit.user_id)
            .eq('stage_number', stageNumber)
            .maybeSingle();

          // Fetch grandchildren (links then profiles)
          const { data: grandchildrenLinks } = await supabase
            .from('network_tree')
            .select('user_id, created_at, parent_id')
            .eq('parent_id', recruit.user_id)
            .order('created_at', { ascending: true });

          let downlines: any[] = [];
          const grandchildIds = (grandchildrenLinks || []).map((gc: any) => gc.user_id);
          if (grandchildIds.length > 0) {
            const { data: gcProfiles } = await supabase
              .from('profiles')
              .select('user_id, full_name, username, avatar_url, current_stage, created_at')
              .in('user_id', grandchildIds);

            downlines = (gcProfiles || []).map((gc: any) => ({
              id: gc.user_id,
              user_id: gc.user_id,
              full_name: gc.full_name,
              username: gc.username,
              avatar_url: gc.avatar_url,
              current_stage: gc.current_stage,
              joined_at: gc.created_at,
              downlines: []
            }));
          }

          return {
            id: recruit.user_id,
            user_id: recruit.user_id,
            full_name: profile?.full_name || '',
            username: profile?.username || '',
            avatar_url: profile?.avatar_url,
            current_stage: profile?.current_stage || 1,
            joined_at: profile?.created_at || recruit.created_at,
            stage_completed: highestStageCompleted,
            commission_earned: commission?.amount || 0,
            is_locked: isLocked,
            downlines
          };
        })
      );

      // For Stage 2-6, show ALL 6 Stage 1 recruits (both locked and unlocked)
      setNetworkTree(treeWithDownlines);

      // Calculate stage-specific data
      await calculateStageData(treeWithDownlines, stageNumber);
    } catch (error) {
      console.error('Error fetching network tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStageData = async (tree: any[], stage: number) => {
    const commissionAmounts = {
      1: 100,
      2: 150,
      3: 180,
      4: 1000,
      5: 1500,
      6: 2000
    };

    const incentives = {
      2: "Samsung A04s Smartphone",
      3: "R10,000 Card Voucher or Cash",
      4: "R25,000 Card Voucher or Cash",
      5: "R50,000 Card Voucher or Cash",
      6: "R150,000 Card Voucher or Cash"
    };

    const requiredCompletions = {
      1: 6,
      2: 14,
      3: 14,
      4: 14,
      5: 14,
      6: 14
    };

    const perRecruitAmount = commissionAmounts[stage as keyof typeof commissionAmounts];
    const requiredCount = requiredCompletions[stage as keyof typeof requiredCompletions];
    
    // Count total and completed recruits
    let totalRecruits = 0;
    let completedRecruits = 0;

    if (stage === 1) {
      // Stage 1: count all network members (direct + indirect) up to 6
      totalRecruits = tree.length;
      tree.forEach((member: any) => {
        if (member.downlines && member.downlines.length > 0) {
          totalRecruits += member.downlines.length;
        }
      });
      // Cap at 6 for Stage 1
      totalRecruits = Math.min(totalRecruits, 6);
      completedRecruits = totalRecruits;
    } else {
      // Stages 2-6: need 14 completions from downline network
      // Count all downline members who completed the previous stage
      const allDownlines: any[] = [];
      tree.forEach((member: any) => {
        allDownlines.push(member);
        if (member.downlines && member.downlines.length > 0) {
          allDownlines.push(...member.downlines);
        }
      });
      
      totalRecruits = Math.min(allDownlines.length, requiredCount);
      completedRecruits = allDownlines.filter(
        (m: any) => !m.is_locked && m.stage_completed >= (stage - 1)
      ).length;
      completedRecruits = Math.min(completedRecruits, requiredCount);
    }

    const totalEarned = completedRecruits * perRecruitAmount;
    const isComplete = completedRecruits >= requiredCount;

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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'network_tree'
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
