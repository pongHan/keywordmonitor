const db = require('../config/database'); // Assuming database connection setup

// Model function to insert notification data
const insertNotificationData = async (config, detectedTitle) => {
    try {
        const query = `
            INSERT INTO km_detect (
                req_id,
                req_mb_id,
                board_name,
                post_url,
                keyword,
                detect_datetime,
                detect_title,
                detect_status
            ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, '1')
            RETURNING id
        `;
        
        const values = [
            config.id,
            config.receiver_email,
            config.board_name,
            config.url,
            config.keyword,
            detectedTitle
        ];
        
        const result = await db.query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error('Error inserting notification data:', error);
        throw error;
    }
};

// Controller function with the notification logic
const sendNotification = async (config, postsToNotify, detectedTitle) => {
    try {
        if (postsToNotify.length > 0) {
            // Insert notification data before sending email
            const notificationId = await insertNotificationData(config, detectedTitle);
            
            // Proceed with email sending
            await sendEmail({
                subject: `[알림] 키워드 "${config.keyword}" 관련 최근 게시물`,
                posts: postsToNotify,
                receiverEmail: config.receiver_email,
                receiverName: config.receiver_name,
            });
            
            return { success: true, notificationId };
        }
        return { success: false, message: 'No posts to notify' };
    } catch (error) {
        console.error('Error in sendNotification:', error);
        throw error;
    }
};

module.exports = {
    sendNotification
};