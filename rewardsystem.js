// ---------- Reward System ----------
const rewardThresholds = [
    { rank: 'Bronze', minPoints: 0 },
    { rank: 'Silver', minPoints: 100 },
    { rank: 'Gold', minPoints: 250 },
    { rank: 'Platinum', minPoints: 500 },
    { rank: 'Diamond', minPoints: 1000 }
];

// Function to calculate random points for actions
function getRandomPoints(actionType) {
    switch(actionType){
        case 'status_post': return Math.floor(Math.random()*10) + 5; // 5-14 points
        case 'photo_post': return Math.floor(Math.random()*20) + 10;  // 10-29 points
        case 'message_sent': return Math.floor(Math.random()*5) + 1;  // 1-5 points
        default: return 1;
    }
}

// Update user points in Supabase
async function rewardUser(userId, actionType) {
    try {
        // 1. Get current points
        const { data: userData, error } = await supabaseClient
            .from('profiles')
            .select('points')
            .eq('id', userId)
            .single();
        if(error) throw error;

        const pointsEarned = getRandomPoints(actionType);
        const newPoints = (userData.points || 0) + pointsEarned;

        // 2. Determine rank based on new points
        let newRank = rewardThresholds[0].rank;
        for(const threshold of rewardThresholds){
            if(newPoints >= threshold.minPoints) newRank = threshold.rank;
        }

        // 3. Update Supabase
        const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ points: newPoints, rank: newRank })
            .eq('id', userId);
        if(updateError) throw updateError;

        console.log(`User ${userId} earned ${pointsEarned} points for ${actionType}. Total: ${newPoints}, Rank: ${newRank}`);
    } catch(err) {
        console.error('Reward Error:', err);
    }
}

// Example usage (call this in your main app when an action happens)
// rewardUser('USER_ID_HERE', 'status_post');
// rewardUser('USER_ID_HERE', 'photo_post');
// rewardUser('USER_ID_HERE', 'message_sent');
