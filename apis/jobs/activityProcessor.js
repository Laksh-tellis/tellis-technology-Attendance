const { prisma } = require('../utils/database');


const processActivityData = async (activityData) => {
  try {
    const {
      userId,
      type,
      timestamp,
      metadata,
      sessionId
    } = activityData;

    // Validate activity data
    if (!userId || !type || !timestamp) {
      throw new Error('Invalid activity data: missing required fields');
    }

    // Process metadata if present
    let processedMetadata = metadata;
    if (metadata && typeof metadata === 'object') {
      processedMetadata = {
        ...metadata,
        processedAt: new Date().toISOString(),
        version: '1.0'
      };
    }

    // Create activity record
    const activity = await prisma.activity.create({
      data: {
        userId,
        type,
        timestamp: new Date(timestamp),
        metadata: processedMetadata,
        sessionId,
        status: 'COMPLETED'
      }
    });

    return {
      success: true,
      activityId: activity.id,
      processedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Activity processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Bulk process activities
 * @param {Array} activities - Array of activity data
 * @returns {Promise<Object>} Processing results
 */
const bulkProcessActivities = async (activities) => {
  try {
    if (!Array.isArray(activities) || activities.length === 0) {
      throw new Error('Invalid activities data: must be a non-empty array');
    }

    const results = [];
    const errors = [];

    // Process activities in batches
    const batchSize = 100;
    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(activity => processActivityData(activity))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          results.push(result.value);
        } else {
          errors.push({
            index: i + index,
            error: result.reason || result.value?.error || 'Unknown error'
          });
        }
      });
    }

    return {
      success: true,
      processed: results.length,
      errors: errors.length,
      total: activities.length,
      results,
      errors
    };

  } catch (error) {
    console.error('Bulk activity processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clean up old activity data
 * @param {number} daysToKeep - Number of days to keep data
 * @returns {Promise<Object>} Cleanup results
 */
const cleanupOldActivities = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Delete old activities
    const deletedActivities = await prisma.activity.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    // Delete old sessions
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        startTime: {
          lt: cutoffDate
        }
      }
    });

    // Delete old screenshots
    const deletedScreenshots = await prisma.screenshot.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return {
      success: true,
      deletedActivities: deletedActivities.count,
      deletedSessions: deletedSessions.count,
      deletedScreenshots: deletedScreenshots.count,
      cutoffDate: cutoffDate.toISOString()
    };

  } catch (error) {
    console.error('Activity cleanup error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate activity reports
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Report data
 */
const generateActivityReport = async (options = {}) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      endDate = new Date(),
      userId,
      groupBy = 'day'
    } = options;

    // Build query conditions
    const where = {
      timestamp: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (userId) {
      where.userId = userId;
    }

    // Get activity statistics
    const [
      totalActivities,
      activitiesByType,
      activitiesByUser,
      dailyStats
    ] = await Promise.all([
      // Total activities
      prisma.activity.count({ where }),
      
      // Activities by type
      prisma.activity.groupBy({
        by: ['type'],
        where,
        _count: {
          type: true
        }
      }),
      
      // Activities by user
      prisma.activity.groupBy({
        by: ['userId'],
        where,
        _count: {
          userId: true
        }
      }),
      
      // Daily statistics
      prisma.$queryRaw`
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as total_activities,
          COUNT(CASE WHEN type = 'ACTIVE' THEN 1 END) as active_count,
          COUNT(CASE WHEN type = 'IDLE' THEN 1 END) as idle_count,
          COUNT(CASE WHEN type = 'BREAK' THEN 1 END) as break_count
        FROM activities 
        WHERE timestamp >= ${new Date(startDate)}
        AND timestamp <= ${new Date(endDate)}
        ${userId ? `AND user_id = ${userId}` : ''}
        GROUP BY DATE(timestamp)
        ORDER BY date
      `
    ]);

    // Format report data
    const report = {
      period: {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      },
      summary: {
        totalActivities,
        activitiesByType: activitiesByType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {}),
        uniqueUsers: activitiesByUser.length
      },
      dailyStats,
      generatedAt: new Date().toISOString()
    };

    return {
      success: true,
      report
    };

  } catch (error) {
    console.error('Activity report generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  processActivityData,
  bulkProcessActivities,
  cleanupOldActivities,
  generateActivityReport
}; 