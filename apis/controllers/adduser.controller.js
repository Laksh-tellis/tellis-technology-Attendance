const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, teamName, role, status } = req.body;

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { name: teamName },
    });

    if (!team) {
      return res.status(400).json({ error: 'Invalid team name' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
        status: status || 'ACTIVE',
        team: {
          connect: { id: team.id },
        },
      },
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
