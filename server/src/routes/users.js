const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users with task stats (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        _count: {
          select: { tasks: true }
        },
        tasks: {
          select: { status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate task stats for each user
    const usersWithStats = users.map(user => {
      const taskCounts = {
        total: user._count.tasks,
        todo: user.tasks.filter(t => t.status === 'TODO').length,
        in_progress: user.tasks.filter(t => t.status === 'IN_PROGRESS').length,
        done: user.tasks.filter(t => t.status === 'DONE').length
      };

      const { tasks, _count, ...userWithoutTasks } = user;
      return {
        ...userWithoutTasks,
        taskCounts
      };
    });

    res.json(usersWithStats);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's tasks (admin only)
router.get('/:userId/tasks', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;