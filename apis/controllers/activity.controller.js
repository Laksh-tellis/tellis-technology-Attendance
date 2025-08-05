const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Record new activity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const recordActivity = async (req, res) => {
  try {
    const { type, description, metadata, sessionId } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Activity type is required'
      });
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        userId,
        sessionId,
        type,
        description,
        metadata,
        status: 'COMPLETED'
      },
      select: {
        id: true,
        type: true,
        status: true,
        description: true,
        timestamp: true,
        metadata: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Activity recorded successfully',
      data: { activity }
    });

  } catch (error) {
    console.error('Record activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get activities with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getActivities = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      userId, 
      type, 
      status, 
      startDate, 
      endDate,
      sessionId 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (userId) {
      where.userId = userId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get activities with count
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        select: {
          id: true,
          type: true,
          status: true,
          description: true,
          timestamp: true,
          metadata: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          session: {
            select: {
              id: true,
              startTime: true,
              ipAddress: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { timestamp: 'desc' }
      }),
      prisma.activity.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get activity by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        description: true,
        timestamp: true,
        metadata: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        session: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            ipAddress: true,
            userAgent: true
          }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { activity }
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update activity status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateActivityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    // Check if activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id }
    });

    if (!existingActivity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Update activity
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        status,
        description,
        updatedAt: new Date()
      },
      select: {
        id: true,
        type: true,
        status: true,
        description: true,
        timestamp: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: { activity: updatedActivity }
    });

  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get activity statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Build user filter
    const userFilter = userId ? { userId } : {};

    // Get activity statistics
    const [totalActivities, activitiesByType, activitiesByStatus, recentActivities] = await Promise.all([
      // Total activities
      prisma.activity.count({
        where: {
          ...dateFilter,
          ...userFilter
        }
      }),
      
      // Activities by type
      prisma.activity.groupBy({
        by: ['type'],
        where: {
          ...dateFilter,
          ...userFilter
        },
        _count: {
          type: true
        }
      }),
      
      // Activities by status
      prisma.activity.groupBy({
        by: ['status'],
        where: {
          ...dateFilter,
          ...userFilter
        },
        _count: {
          status: true
        }
      }),
      
      // Recent activities
      prisma.activity.findMany({
        where: {
          ...dateFilter,
          ...userFilter
        },
        select: {
          id: true,
          type: true,
          status: true,
          timestamp: true,
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        take: 10,
        orderBy: { timestamp: 'desc' }
      })
    ]);

    // Format statistics
    const stats = {
      totalActivities,
      byType: activitiesByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {}),
      byStatus: activitiesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      recentActivities
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Bulk record activities (for Electron agent)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bulkRecordActivities = async (req, res) => {
  try {
    const { activities } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Activities array is required'
      });
    }

    // Validate each activity
    const validActivities = activities.filter(activity => {
      return activity.type && activity.timestamp;
    });

    if (validActivities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid activities found'
      });
    }

    // Create activities
    const createdActivities = await prisma.activity.createMany({
      data: validActivities.map(activity => ({
        userId,
        type: activity.type,
        status: activity.status || 'COMPLETED',
        description: activity.description,
        metadata: activity.metadata,
        timestamp: new Date(activity.timestamp),
        sessionId: activity.sessionId
      }))
    });

    res.status(201).json({
      success: true,
      message: `${createdActivities.count} activities recorded successfully`,
      data: { count: createdActivities.count }
    });

  } catch (error) {
    console.error('Bulk record activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  recordActivity,
  getActivities,
  getActivityById,
  updateActivityStatus,
  getActivityStats,
  bulkRecordActivities
}; 