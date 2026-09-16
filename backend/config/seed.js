const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Course = require('../models/Course');
const Question = require('../models/Question');
const Exam = require('../models/exam');
const Activity = require('../models/Activity');

const seedInitialData = async () => {
  try {
    // 1. Ensure default Admin account exists
    const adminExists = await User.findOne({ email: 'admin@exam.com' });
    let adminUser = adminExists;
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        name: 'System Administrator',
        username: 'admin',
        email: 'admin@exam.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Default Admin created: admin@exam.com / admin123');
      await Activity.create({
        user: 'System',
        role: 'admin',
        action: 'Admin Account Initialized',
        details: 'Default Administrator account provisioned in MongoDB',
        type: 'auth'
      });
    }

    // 2. Ensure default Teacher exists
    let teacherUser = await User.findOne({ email: 'teacher@exam.com' });
    if (!teacherUser) {
      const hashedPassword = await bcrypt.hash('teacher123', 10);
      teacherUser = await User.create({
        name: 'Prof. Alex Johnson',
        username: 'alex_teacher',
        email: 'teacher@exam.com',
        password: hashedPassword,
        role: 'teacher'
      });
      console.log('✅ Default Teacher created: teacher@exam.com / teacher123');
    }

    // 3. Ensure default Student exists
    let studentUser = await User.findOne({ email: 'student@exam.com' });
    if (!studentUser) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      studentUser = await User.create({
        name: 'John Student',
        username: 'john_student',
        email: 'student@exam.com',
        password: hashedPassword,
        role: 'student'
      });
      console.log('✅ Default Student created: student@exam.com / student123');
    }

    // 4. Ensure initial Courses exist
    let reactCourse = await Course.findOne({ name: /React/i });
    if (!reactCourse) {
      reactCourse = await Course.create({
        name: 'React JS Fundamentals',
        teacher: 'teacher@exam.com',
        duration: '4 Weeks',
        description: 'Comprehensive course covering React components, hooks, state management, and ecosystem.'
      });
    }

    let nodeCourse = await Course.findOne({ name: /Node/i });
    if (!nodeCourse) {
      nodeCourse = await Course.create({
        name: 'Node.js & Express Backend',
        teacher: 'teacher@exam.com',
        duration: '6 Weeks',
        description: 'Master REST APIs, middleware, MongoDB integration, and server architectures.'
      });
    }

    let pythonCourse = await Course.findOne({ name: /Python/i });
    if (!pythonCourse) {
      pythonCourse = await Course.create({
        name: 'Python Programming Essentials',
        teacher: 'teacher@exam.com',
        duration: '4 Weeks',
        description: 'Core concepts of Python, data structures, OOP, and practical applications.'
      });
    }

    let dbCourse = await Course.findOne({ name: /Mongo|Database/i });
    if (!dbCourse) {
      dbCourse = await Course.create({
        name: 'MongoDB & Database Systems',
        teacher: 'teacher@exam.com',
        duration: '3 Weeks',
        description: 'NoSQL database design, document models, indexing, and aggregation pipelines.'
      });
    }

    console.log('✅ Standard Courses ensured in MongoDB');

    // 5. Ensure initial Questions exist in MongoDB
    const questionCount = await Question.countDocuments();
    if (questionCount < 10) {
      const sampleQuestions = [
        // --- React JS Questions ---
        {
          questionText: "What is React?",
          options: ["Library", "Framework", "Language", "Database"],
          correctAnswer: "Library",
          courseId: reactCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "Who developed React?",
          options: ["Google", "Facebook (Meta)", "Microsoft", "Amazon"],
          correctAnswer: "Facebook (Meta)",
          courseId: reactCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "JSX stands for?",
          options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "None of these"],
          correctAnswer: "JavaScript XML",
          courseId: reactCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "Which hook is used for local state management in functional components?",
          options: ["useState", "useEffect", "useRef", "useMemo"],
          correctAnswer: "useState",
          courseId: reactCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "Which hook is used for side effects in React?",
          options: ["useState", "useEffect", "useContext", "useReducer"],
          correctAnswer: "useEffect",
          courseId: reactCourse._id,
          difficulty: "Medium",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "Props in React are ____",
          options: ["Read-only (Immutable)", "Mutable", "Private to child", "Global"],
          correctAnswer: "Read-only (Immutable)",
          courseId: reactCourse._id,
          difficulty: "Medium",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "What is the Virtual DOM in React used for?",
          options: ["Improving UI rendering performance", "Directly modifying browser DOM", "Database queries", "Server-side caching"],
          correctAnswer: "Improving UI rendering performance",
          courseId: reactCourse._id,
          difficulty: "Medium",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "Which hook provides a reference to DOM nodes or mutable values across renders?",
          options: ["useRef", "useCallback", "useState", "useId"],
          correctAnswer: "useRef",
          courseId: reactCourse._id,
          difficulty: "Medium",
          marks: 1,
          createdBy: "Admin"
        },

        // --- Node.js & Express Questions ---
        {
          questionText: "Which runtime environment executes JavaScript on the server side?",
          options: ["Node.js", "Chrome V8 Browser", "React", "Angular"],
          correctAnswer: "Node.js",
          courseId: nodeCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },
        {
          questionText: "What method in Express is used to register route middleware?",
          options: ["app.use()", "app.set()", "app.listen()", "app.config()"],
          correctAnswer: "app.use()",
          courseId: nodeCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },
        {
          questionText: "Which core module in Node.js handles file operations?",
          options: ["fs", "path", "http", "events"],
          correctAnswer: "fs",
          courseId: nodeCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },
        {
          questionText: "What is the event-driven architecture of Node.js based on?",
          options: ["Single-threaded Event Loop", "Multi-threaded blocking I/O", "Synchronous polling", "Thread pooling per request"],
          correctAnswer: "Single-threaded Event Loop",
          courseId: nodeCourse._id,
          difficulty: "Medium",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },
        {
          questionText: "Which HTTP status code signifies a successful resource creation?",
          options: ["201 Created", "200 OK", "204 No Content", "202 Accepted"],
          correctAnswer: "201 Created",
          courseId: nodeCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },
        {
          questionText: "What is NPM in the Node.js ecosystem?",
          options: ["Node Package Manager", "Node Program Module", "Network Protocol Method", "Node Path Modifier"],
          correctAnswer: "Node Package Manager",
          courseId: nodeCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },

        // --- Python Questions ---
        {
          questionText: "Which keyword is used to define a function in Python?",
          options: ["def", "function", "fun", "define"],
          correctAnswer: "def",
          courseId: pythonCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "Which data structure in Python is ordered, mutable, and allows duplicates?",
          options: ["List", "Tuple", "Set", "Dictionary key"],
          correctAnswer: "List",
          courseId: pythonCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "What is the output of type(10 / 2) in Python 3?",
          options: ["<class 'float'>", "<class 'int'>", "<class 'double'>", "<class 'number'>"],
          correctAnswer: "<class 'float'>",
          courseId: pythonCourse._id,
          difficulty: "Medium",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "Which statement is used to handle exceptions in Python?",
          options: ["try...except", "try...catch", "do...catch", "try...rescue"],
          correctAnswer: "try...except",
          courseId: pythonCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "What is a lambda function in Python?",
          options: ["An anonymous single-expression function", "A recursive loop", "A class decorator", "A type casting method"],
          correctAnswer: "An anonymous single-expression function",
          courseId: pythonCourse._id,
          difficulty: "Medium",
          marks: 1,
          createdBy: "Admin"
        },
        {
          questionText: "Which built-in Python function returns the number of items in an object?",
          options: ["len()", "count()", "size()", "length()"],
          correctAnswer: "len()",
          courseId: pythonCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Admin"
        },

        // --- MongoDB Questions ---
        {
          questionText: "What type of database is MongoDB?",
          options: ["Document-oriented NoSQL", "Relational SQL", "Graph-only", "In-memory cache only"],
          correctAnswer: "Document-oriented NoSQL",
          courseId: dbCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },
        {
          questionText: "What format does MongoDB use to store documents internally?",
          options: ["BSON (Binary JSON)", "XML", "CSV", "YAML"],
          correctAnswer: "BSON (Binary JSON)",
          courseId: dbCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },
        {
          questionText: "Which default field is automatically generated by MongoDB as a unique primary key?",
          options: ["_id", "id", "key", "uid"],
          correctAnswer: "_id",
          courseId: dbCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },
        {
          questionText: "Which MongoDB method is used to find all documents matching a query in a collection?",
          options: ["find()", "search()", "query()", "select()"],
          correctAnswer: "find()",
          courseId: dbCourse._id,
          difficulty: "Easy",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        },
        {
          questionText: "Which operator is used in MongoDB aggregation to filter documents?",
          options: ["$match", "$filter", "$where", "$query"],
          correctAnswer: "$match",
          courseId: dbCourse._id,
          difficulty: "Medium",
          marks: 1,
          createdBy: "Prof. Alex Johnson"
        }
      ];

      await Question.insertMany(sampleQuestions);
      console.log(`✅ ${sampleQuestions.length} Questions seeded into MongoDB`);
    }

    // 6. Ensure multiple Exams exist in MongoDB
    const examCount = await Exam.countDocuments();
    if (examCount < 3) {
      const allQuestions = await Question.find();
      const reactQs = allQuestions.filter(q => String(q.courseId) === String(reactCourse._id)).map(q => q._id);
      const nodeQs = allQuestions.filter(q => String(q.courseId) === String(nodeCourse._id)).map(q => q._id);
      const pythonQs = allQuestions.filter(q => String(q.courseId) === String(pythonCourse._id)).map(q => q._id);
      const dbQs = allQuestions.filter(q => String(q.courseId) === String(dbCourse._id)).map(q => q._id);

      const examsToCreate = [];

      if (reactQs.length > 0 && !(await Exam.findOne({ title: /React/i }))) {
        examsToCreate.push({
          title: "React JS Certification Exam",
          examname: "React JS Certification Exam",
          examcode: "REACT-101",
          courseId: reactCourse._id,
          questionIds: reactQs,
          durationMinutes: 30,
          totalMarks: reactQs.length,
          passMarks: Math.ceil(reactQs.length * 0.4),
          date: new Date().toISOString().split('T')[0],
          starttime: "10:00 AM",
          createdBy: teacherUser ? teacherUser._id : adminUser._id
        });
      }

      if (nodeQs.length > 0 && !(await Exam.findOne({ title: /Node/i }))) {
        examsToCreate.push({
          title: "Node.js & Express REST APIs Exam",
          examname: "Node.js & Express REST APIs Exam",
          examcode: "NODE-201",
          courseId: nodeCourse._id,
          questionIds: nodeQs,
          durationMinutes: 45,
          totalMarks: nodeQs.length,
          passMarks: Math.ceil(nodeQs.length * 0.4),
          date: new Date().toISOString().split('T')[0],
          starttime: "11:30 AM",
          createdBy: teacherUser ? teacherUser._id : adminUser._id
        });
      }

      if (pythonQs.length > 0 && !(await Exam.findOne({ title: /Python/i }))) {
        examsToCreate.push({
          title: "Python Core Programming Test",
          examname: "Python Core Programming Test",
          examcode: "PY-301",
          courseId: pythonCourse._id,
          questionIds: pythonQs,
          durationMinutes: 30,
          totalMarks: pythonQs.length,
          passMarks: Math.ceil(pythonQs.length * 0.4),
          date: new Date().toISOString().split('T')[0],
          starttime: "02:00 PM",
          createdBy: teacherUser ? teacherUser._id : adminUser._id
        });
      }

      if (dbQs.length > 0 && !(await Exam.findOne({ title: /Mongo|Database/i }))) {
        examsToCreate.push({
          title: "MongoDB & Database Systems Exam",
          examname: "MongoDB & Database Systems Exam",
          examcode: "MDB-401",
          courseId: dbCourse._id,
          questionIds: dbQs,
          durationMinutes: 35,
          totalMarks: dbQs.length,
          passMarks: Math.ceil(dbQs.length * 0.4),
          date: new Date().toISOString().split('T')[0],
          starttime: "04:00 PM",
          createdBy: teacherUser ? teacherUser._id : adminUser._id
        });
      }

      if (examsToCreate.length > 0) {
        await Exam.insertMany(examsToCreate);
        console.log(`✅ ${examsToCreate.length} Live Examinations created in MongoDB!`);
      }
    }

    await Activity.create({
      user: 'System',
      role: 'system',
      action: 'Database Initialized',
      details: 'Provisioned multiple courses, rich question bank, and multi-exam portal in MongoDB',
      type: 'question'
    });
  } catch (err) {
    console.error('Seed error:', err);
  }
};

module.exports = seedInitialData;
