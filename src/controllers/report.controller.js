const { pool } = require('../config/db.config');
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
    // Corrected User ID
    const userId = req.user.id; 
    
    const { violationCode, mediaKey, location, deviceInfo } = req.body;

    if (!violationCode || !mediaKey || !location || !location.latitude || !location.longitude) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "Missing required report fields." });
    }

    try {
        // 1. Construct the Media URL (Required by DB)
        // Since we are mocking, we just create a fake URL string using the key
        const mediaUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${mediaKey}`;

        // 2. Prepare Geometry Query (Longitude is X, Latitude is Y)
        // Note: Placeholders $5 and $6 will be used here
        const geometryQuery = `ST_SetSRID(ST_MakePoint($5, $6), 4326)`;

        // 3. SQL Query - ADDED media_url column
        const query = `
            INSERT INTO violation_reports (
                user_id, violation_code, media_key, media_url, location_geom, address_label, device_info
            )
            VALUES ($1, $2, $3, $4, ${geometryQuery}, $7, $8)
            RETURNING id, status;
        `;
        
        // 4. Values Array - ADDED mediaUrl and aligned indices
        const values = [
            userId,                 // $1
            violationCode,          // $2
            mediaKey,               // $3
            mediaUrl,               // $4 (NEW: The missing column)
            location.longitude,     // $5 (for ST_MakePoint X)
            location.latitude,      // $6 (for ST_MakePoint Y)
            location.addressLabel || null, // $7
            deviceInfo,             // $8
        ];

        const result = await pool.query(query, values);
        const reportId = result.rows[0].id;

        return res.status(201).json({ 
            data: {
                reportId: reportId,
                status: 'PENDING',
                estimatedReviewTime: "48 hours",
                message: "Report submitted successfully."
            }
        });

    } catch (error) {
        if (error.message && error.message.includes('Daily upload limit')) {
             return res.status(400).json({ code: "DAILY_LIMIT_EXCEEDED", message: error.message });
        }
        console.error('Report submission error:', error);
        return res.status(500).json({ code: "INTERNAL_ERROR", message: "Internal Server Error." });
    }
};

module.exports = {
    generateUploadUrl,
    submitReport
};