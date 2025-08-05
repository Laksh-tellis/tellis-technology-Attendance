const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get dashboard overview statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get dashboard statistics
    const [
      totalEmployees,
      activeEmployees,
      totalActivities,
      totalSessions,
      activitiesByType,
      recentActivities,
      topActiveUsers
    ] = await Promise.all([
      // Total employees
      prisma.user.count({
        where: { isActive: true }
      }),
      
      // Active employees (logged in within last 7 days)
      prisma.user.count({
        where: {
          isActive: true,
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Total activities
      prisma.activity.count({
        where: dateFilter
      }),
      
      // Total sessions
      prisma.session.count({
        where: {
          startTime: dateFilter.timestamp || undefined
        }
      }),
      
      // Activities by type
      prisma.activity.groupBy({
        by: ['type'],
        where: dateFilter,
        _count: {
          type: true
        }
      }),
      
      // Recent activities
      prisma.activity.findMany({
        where: dateFilter,
        select: {
          id: true,
          type: true,
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
      }),
      
      // Top active users
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          lastLoginAt: true,
          _count: {
            select: {
              activities: {
                where: dateFilter
              }
            }
          }
        },
        orderBy: {
          activities: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Format overview data
    const overview = {
      totalEmployees,
      activeEmployees,
      totalActivities,
      totalSessions,
      activityRate: totalEmployees > 0 ? (activeEmployees / totalEmployees * 100).toFixed(1) : 0,
      activitiesByType: activitiesByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {}),
      recentActivities,
      topActiveUsers
    };

    res.status(200).json({
      success: true,
      data: { overview }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get productivity analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProductivityAnalytics = async (req, res) => {
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

    // Get productivity data
    const [
      activeTime,
      idleTime,
      breakTime,
      meetingTime,
      productivityByDay,
      productivityByUser
    ] = await Promise.all([
      // Active time
      prisma.activity.count({
        where: {
          ...dateFilter,
          ...userFilter,
          type: 'ACTIVE'
        }
      }),
      
      // Idle time
      prisma.activity.count({
        where: {
          ...dateFilter,
          ...userFilter,
          type: 'IDLE'
        }
      }),
      
      // Break time
      prisma.activity.count({
        where: {
          ...dateFilter,
          ...userFilter,
          type: 'BREAK'
        }
      }),
      
      // Meeting time
      prisma.activity.count({
        where: {
          ...dateFilter,
          ...userFilter,
          type: 'MEETING'
        }
      }),
      
      // Productivity by day
      prisma.$queryRaw`
        SELECT 
          DATE(timestamp) as date,
          COUNT(CASE WHEN type = 'ACTIVE' THEN 1 END) as active_count,
          COUNT(CASE WHEN type = 'IDLE' THEN 1 END) as idle_count,
          COUNT(CASE WHEN type = 'BREAK' THEN 1 END) as break_count
        FROM activities 
        WHERE timestamp >= ${dateFilter.timestamp?.gte || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        AND timestamp <= ${dateFilter.timestamp?.lte || new Date()}
        ${userId ? `AND user_id = ${userId}` : ''}
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        LIMIT 30
      `,
      
      // Productivity by user
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          activities: {
            where: dateFilter,
            select: {
              type: true,
              timestamp: true
            }
          }
        }
      })
    ]);

    // Calculate productivity metrics
    const totalActivities = activeTime + idleTime + breakTime + meetingTime;
    const productivityScore = totalActivities > 0 ? (activeTime / totalActivities * 100).toFixed(1) : 0;

    const analytics = {
      timeBreakdown: {
        active: activeTime,
        idle: idleTime,
        break: breakTime,
        meeting: meetingTime,
        total: totalActivities
      },
      productivityScore: parseFloat(productivityScore),
      productivityByDay,
      productivityByUser: productivityByUser.map(user => ({
        ...user,
        activityCount: user.activities.length,
        activeCount: user.activities.filter(a => a.type === 'ACTIVE').length,
        productivityScore: user.activities.length > 0 
          ? (user.activities.filter(a => a.type === 'ACTIVE').length / user.activities.length * 100).toFixed(1)
          : 0
      }))
    };

    res.status(200).json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    console.error('Get productivity analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get real-time monitoring data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRealTimeMonitoring = async (req, res) => {
  try {
    // Get current active sessions
    const activeSessions = await prisma.session.findMany({
      where: {
        isActive: true,
        endTime: null
      },
      select: {
        id: true,
        startTime: true,
        ipAddress: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        activities: {
          take: 5,
          orderBy: { timestamp: 'desc' },
          select: {
            type: true,
            timestamp: true,
            description: true
          }
        }
      }
    });

    // Get recent activities (last 30 minutes)
    const recentActivities = await prisma.activity.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 60 * 1000)
        }
      },
      select: {
        id: true,
        type: true,
        timestamp: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      take: 20,
      orderBy: { timestamp: 'desc' }
    });

    // Get online users count
    const onlineUsers = await prisma.user.count({
      where: {
        isActive: true,
        lastLoginAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Active in last 15 minutes
        }
      }
    });

    const monitoring = {
      activeSessions: activeSessions.length,
      onlineUsers,
      activeSessions,
      recentActivities
    };

    res.status(200).json({
      success: true,
      data: { monitoring }
    });

  } catch (error) {
    console.error('Get real-time monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get system health status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSystemHealth = async (req, res) => {
  try {
    // Get system statistics
    const [
      totalUsers,
      totalActivities,
      totalSessions,
      recentErrors
    ] = await Promise.all([
      prisma.user.count(),
      prisma.activity.count(),
      prisma.session.count(),
      // You can add error logging table and query here
      Promise.resolve([])
    ]);

    // Calculate system health metrics
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      totalUsers,
      totalActivities,
      totalSessions,
      recentErrors: recentErrors.length,
      database: 'connected',
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: { health }
    });

  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardOverview,
  getProductivityAnalytics,
  getRealTimeMonitoring,
  getSystemHealth
}; 