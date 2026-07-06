require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Board = require("../models/Board");
const List = require("../models/List");
const Card = require("../models/Card");

async function seed() {
  await connectDB();

  console.log("[seed] Clearing existing demo data...");
  await Promise.all([User.deleteMany({}), Board.deleteMany({}), List.deleteMany({}), Card.deleteMany({})]);

  const users = await User.create([
    { name: "Ayesha Khan", email: "ayesha@example.com", password: "password123" },
    { name: "Bilal Ahmed", email: "bilal@example.com", password: "password123" },
    { name: "Sara Malik", email: "sara@example.com", password: "password123" },
  ]);

  const board = await Board.create({
    title: "Website Redesign",
    description: "Q3 redesign of the marketing site",
    owner: users[0]._id,
    members: users.map((u) => u._id),
  });

  const listDefs = ["Backlog", "In Progress", "Review", "Done"];
  const lists = await List.insertMany(listDefs.map((t, i) => ({ title: t, board: board._id, position: i })));

  const cardDefs = [
    { title: "Set up design tokens", list: 0, priority: "medium" },
    { title: "Wireframe homepage", list: 0, priority: "low" },
    { title: "Build navbar component", list: 1, priority: "high" },
    { title: "Integrate Socket.io presence", list: 1, priority: "urgent" },
    { title: "Write pricing page copy", list: 2, priority: "medium" },
    { title: "QA on mobile breakpoints", list: 2, priority: "high" },
    { title: "Deploy staging environment", list: 3, priority: "medium", completed: true },
  ];

  for (let i = 0; i < cardDefs.length; i++) {
    const c = cardDefs[i];
    const card = await Card.create({
      title: c.title,
      board: board._id,
      list: lists[c.list]._id,
      priority: c.priority,
      completed: !!c.completed,
      assignees: [users[i % users.length]._id],
      position: i,
    });
    lists[c.list].cardOrder = lists[c.list].cardOrder || [];
    lists[c.list].cardOrder.push(card._id);
  }

  board.listOrder = lists.map((l) => l._id);
  await board.save();
  await Promise.all(lists.map((l) => l.save()));

  console.log("[seed] Done. Login with ayesha@example.com / password123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
