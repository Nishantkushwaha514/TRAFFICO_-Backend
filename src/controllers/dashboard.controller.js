const { pool } = require('../config/db.config');

// --- 1. GET /api/dashboard/stats ---
const getStats = async (req, res) => {
    // ⚠️ CRITICAL FIX: Using your real, registered user ID for testing (dd5c71b6-2cf9-438b-b7a8-df54ecfccddf)
    const userId = req.user.id; 

    try {
        // Query the 'user_stats' VIEW created in your PostgreSQL schema
        const query = 'SELECT * FROM user_stats WHERE user_id = $1';
        const result = await pool.query(query, [userId]);
        const stats = result.rows[0];

        // Prepare the response data (returning 0s if no data is found)
        const data = stats ? {
            // These properties match the user_stats VIEW columns
            totalPoints: stats.total_points,
            verifiedCount: parseInt(stats.verified_count),
            underReviewCount: parseInt(stats.under_review_count),
            pendingCount: parseInt(stats.pending_count),
            rejectedCount: parseInt(stats.rejected_count),
            totalReports: parseInt(stats.total_reports),
        } : { // Default to zeros if user exists but has no reports (unlikely here)
            totalPoints: 0, 
            verifiedCount: 0, 
            underReviewCount: 0, 
            pendingCount: 0, 
            rejectedCount: 0, 
            totalReports: 0 
        };

        return res.status(200).json({ data });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch stats." });
    }
};

module.exports = { getStats };