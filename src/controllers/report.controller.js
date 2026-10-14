const { pool } = require('../config/db.config.js');
const { v4: uuidv4 } = require('uuid');

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'traffico-media-bucket';
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB limit

// --- 1. GET /api/reports/upload-url (MOCK Function) ---
const generateUploadUrl = async (req, res) => {
    // Placeholder userId
    const userId = req.user.id; 
    const { fileName, fileType, fileSize } = req.query;

    if (!fileName || !fileType || !fileSize) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Missing file metadata." });
    }
    
    if (parseInt(fileSize) > MAX_FILE_SIZE_BYTES) {
        return res.status(400).json({ code: "FILE_TOO_LARGE", message: "File size exceeds 50MB limit." });
    }
    
    const uniqueId = uuidv4().substring(0, 8);
    const s3Key = `MOCK_uploads/${userId}/${Date.now()}_${uniqueId}.mp4`;

    return res.status(200).json({
        data: {
            uploadUrl: "https://MOCK-S3-URL-VALID-FOR-5_MINUTES",
            key: s3Key,
            expiresIn: 300,
            message: "MOCK: Upload URL successfully generated (S3 bypassed)."
        }
    });
};


// --- 2. POST /api/reports (Submit Report Metadata) ---
const submitReport = async (req, res) => {
    const userId = req.user.id;
    const { violationCode, mediaKey, location, deviceInfo } = req.body;

    if (!violationCode || !mediaKey || !location || !location.latitude || !location.longitude) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Missing required report fields." });
    }

    try {
        const mediaUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${mediaKey}`;
        const query = `
            INSERT INTO violation_reports (
                user_id,
                violation_code,
                media_key,
                media_url,
                location_geom,
                address_label,
                device_info,
                status
            )
            VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, 'PENDING')
            RETURNING id, status;
        `;

        const values = [
            userId,
            violationCode,
            mediaKey,
            mediaUrl,
            location.longitude,
            location.latitude,
            location.addressLabel || null,
            deviceInfo || {}
        ];

        const result = await pool.query(query, values);
        const reportId = result.rows[0].id;

        return res.status(201).json({
            data: {
                reportId: reportId,
                status: 'PENDING',
                estimatedReviewTime: '48 hours',
                message: 'Report submitted successfully.'
            }
        });
    } catch (error) {
        if (error.message && error.message.includes('Daily upload limit')) {
            return res.status(400).json({ code: 'DAILY_LIMIT_EXCEEDED', message: error.message });
        }
        console.error('Report submission error:', error);
        return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal Server Error.' });
    }
};

// --- 3. GET /api/reports/rules (TEMPORARY TEST FUNCTION) ---
// This function tests the DB client connection.
const getViolationRules = async (req, res) => {
    try {
        const query = `
            SELECT 
                violation_code, 
                violation_name, 
                description, 
                points_awarded, 
                base_fine_amount, 
                review_time_hours 
            FROM violation_rules
            ORDER BY points_awarded DESC;
        `;

        const result = await pool.query(query);

        return res.status(200).json({
            data: result.rows
        });

    } catch (error) {
        console.error('Final DB Error Check:', error.message);
        return res.status(500).json({
            code: 'DB_FETCH_ERROR',
            message: 'Failed to load violation rules (Final Check Failed).'
        });
    }
};

module.exports = {
    generateUploadUrl,
    submitReport,
    getViolationRules
};