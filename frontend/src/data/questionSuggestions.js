// frontend/src/data/questionSuggestions.js

export const QUESTION_CATEGORIES = [
  { id: "all", label: "All Subjects", icon: "🌐" },
  { id: "react", label: "React.js", icon: "⚛️", keywords: ["react", "jsx", "hooks", "frontend", "redux", "next"] },
  { id: "javascript", label: "JavaScript", icon: "🟨", keywords: ["javascript", "js", "ecmascript", "es6", "frontend", "ts", "typescript"] },
  { id: "python", label: "Python", icon: "🐍", keywords: ["python", "django", "flask", "ai", "pandas", "data science"] },
  { id: "java", label: "Java / OOP", icon: "☕", keywords: ["java", "spring", "oop", "jvm", "backend"] },
  { id: "sql", label: "SQL & Databases", icon: "🗄️", keywords: ["sql", "database", "mongodb", "dbms", "postgres", "mysql", "nosql"] },
  { id: "dsa", label: "DSA & Algorithms", icon: "🌳", keywords: ["dsa", "data structures", "algorithm", "tree", "graph", "sorting", "complexity"] },
  { id: "webdev", label: "Web Dev & Node", icon: "🌐", keywords: ["web", "html", "css", "node", "express", "backend", "api", "rest"] },
  { id: "cpp", label: "C++ & Systems", icon: "⚙️", keywords: ["c++", "cpp", "c programming", "pointers", "memory"] },
  { id: "ml", label: "Machine Learning", icon: "🤖", keywords: ["machine learning", "ml", "ai", "deep learning", "neural", "nlp"] }
];

export const SUGGESTED_QUESTIONS = [
  // ==================== REACT.JS ====================
  {
    id: "react-1",
    category: "react",
    courseTag: "React.js",
    questionText: "What is the primary difference between Props and State in React?",
    options: [
      "Props are immutable & passed from parent; State is managed within the component",
      "Props are mutable; State is immutable",
      "Props are only for class components; State is only for functional components",
      "There is no difference between Props and State"
    ],
    correctAnswer: "Props are immutable & passed from parent; State is managed within the component",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "react-2",
    category: "react",
    courseTag: "React.js",
    questionText: "Which React hook is used to perform side effects in functional components?",
    options: ["useState", "useEffect", "useMemo", "useContext"],
    correctAnswer: "useEffect",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "react-3",
    category: "react",
    courseTag: "React.js",
    questionText: "What is the Virtual DOM in React?",
    options: [
      "A lightweight in-memory JavaScript representation of the real DOM",
      "A physical hardware accelerator for web browsers",
      "A database engine for React applications",
      "A complete replacement for HTML documents"
    ],
    correctAnswer: "A lightweight in-memory JavaScript representation of the real DOM",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "react-4",
    category: "react",
    courseTag: "React.js",
    questionText: "Why should a unique 'key' prop be provided when rendering lists in React?",
    options: [
      "To help React identify which items have changed, added, or removed for efficient reconciliation",
      "To automatically apply CSS styles to each element",
      "To make the array indices accessible in global scope",
      "It is purely optional and does not affect performance"
    ],
    correctAnswer: "To help React identify which items have changed, added, or removed for efficient reconciliation",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "react-5",
    category: "react",
    courseTag: "React.js",
    questionText: "What is the purpose of the useMemo hook in React?",
    options: [
      "To memoize expensive computed values between renders",
      "To create persistent local storage entries",
      "To mutate component state directly",
      "To trigger a re-render on every state change"
    ],
    correctAnswer: "To memoize expensive computed values between renders",
    difficulty: "Hard",
    marks: 1
  },

  // ==================== JAVASCRIPT ====================
  {
    id: "js-1",
    category: "javascript",
    courseTag: "JavaScript",
    questionText: "What is the difference between '==' and '===' in JavaScript?",
    options: [
      "'===' checks both value and type without coercion, while '==' performs type coercion",
      "'==' checks both value and type, while '===' only checks values",
      "They are identical in ES6",
      "'===' is only valid for string comparisons"
    ],
    correctAnswer: "'===' checks both value and type without coercion, while '==' performs type coercion",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "js-2",
    category: "javascript",
    courseTag: "JavaScript",
    questionText: "Which method converts a JSON string into a JavaScript object?",
    options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "Object.parseJSON()"],
    correctAnswer: "JSON.parse()",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "js-3",
    category: "javascript",
    courseTag: "JavaScript",
    questionText: "What will `typeof NaN` return in JavaScript?",
    options: ["number", "NaN", "undefined", "object"],
    correctAnswer: "number",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "js-4",
    category: "javascript",
    courseTag: "JavaScript",
    questionText: "What is a Closure in JavaScript?",
    options: [
      "A function bundled together with references to its lexical environment",
      "A method to close browser tabs via code",
      "A syntax error caused by missing brackets",
      "An anonymous asynchronous callback"
    ],
    correctAnswer: "A function bundled together with references to its lexical environment",
    difficulty: "Hard",
    marks: 1
  },
  {
    id: "js-5",
    category: "javascript",
    courseTag: "JavaScript",
    questionText: "Which array method creates a new array with all elements that pass the test implemented by the provided function?",
    options: ["filter()", "map()", "forEach()", "reduce()"],
    correctAnswer: "filter()",
    difficulty: "Easy",
    marks: 1
  },

  // ==================== PYTHON ====================
  {
    id: "py-1",
    category: "python",
    courseTag: "Python",
    questionText: "What is the fundamental difference between a List and a Tuple in Python?",
    options: [
      "Lists are mutable, whereas tuples are immutable",
      "Tuples are mutable, whereas lists are immutable",
      "Lists can only store numbers; tuples can store any data type",
      "There is no difference in mutability"
    ],
    correctAnswer: "Lists are mutable, whereas tuples are immutable",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "py-2",
    category: "python",
    courseTag: "Python",
    questionText: "How is a generator created in Python?",
    options: [
      "By using the 'yield' keyword inside a function",
      "By inheriting from GeneratorClass",
      "By calling the generate() constructor",
      "By using lambda expressions only"
    ],
    correctAnswer: "By using the 'yield' keyword inside a function",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "py-3",
    category: "python",
    courseTag: "Python",
    questionText: "What is the output of `len({'a': 1, 'b': 2, 'a': 3})` in Python?",
    options: ["2", "3", "4", "Error: Duplicate keys"],
    correctAnswer: "2",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "py-4",
    category: "python",
    courseTag: "Python",
    questionText: "Which keyword is used in Python to handle exceptions gracefully?",
    options: ["try / except", "try / catch", "do / rescue", "test / fail"],
    correctAnswer: "try / except",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "py-5",
    category: "python",
    courseTag: "Python",
    questionText: "What does the Python GIL (Global Interpreter Lock) do?",
    options: [
      "Prevents multiple native threads from executing Python bytecodes simultaneously",
      "Encrypts Python source files during compilation",
      "Locks database rows during transaction commits",
      "Manages garbage collection for circular references"
    ],
    correctAnswer: "Prevents multiple native threads from executing Python bytecodes simultaneously",
    difficulty: "Hard",
    marks: 1
  },

  // ==================== JAVA / OOP ====================
  {
    id: "java-1",
    category: "java",
    courseTag: "Java",
    questionText: "Which keyword in Java prevents a class from being inherited/subclassed?",
    options: ["final", "abstract", "static", "private"],
    correctAnswer: "final",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "java-2",
    category: "java",
    courseTag: "Java",
    questionText: "What is the difference between ArrayList and LinkedList in Java?",
    options: [
      "ArrayList uses a dynamic resizable array; LinkedList uses a doubly linked list",
      "ArrayList is slower for random access than LinkedList",
      "LinkedList is synchronized by default, while ArrayList is not",
      "ArrayList cannot store null values"
    ],
    correctAnswer: "ArrayList uses a dynamic resizable array; LinkedList uses a doubly linked list",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "java-3",
    category: "java",
    courseTag: "Java",
    questionText: "Where are objects allocated in Java memory management?",
    options: ["Heap Memory", "Stack Memory", "Code Segment", "Register Memory"],
    correctAnswer: "Heap Memory",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "java-4",
    category: "java",
    courseTag: "Java",
    questionText: "Can an interface in Java 8 and later contain method implementations?",
    options: [
      "Yes, using default and static methods",
      "No, interfaces can never have concrete code",
      "Only if the interface is declared private",
      "Only through abstract constructors"
    ],
    correctAnswer: "Yes, using default and static methods",
    difficulty: "Medium",
    marks: 1
  },

  // ==================== SQL & DATABASES ====================
  {
    id: "sql-1",
    category: "sql",
    courseTag: "SQL & Databases",
    questionText: "Which SQL clause is used to filter results after grouping with GROUP BY?",
    options: ["HAVING", "WHERE", "ORDER BY", "FILTER"],
    correctAnswer: "HAVING",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "sql-2",
    category: "sql",
    courseTag: "SQL & Databases",
    questionText: "In MongoDB, which command is used to insert multiple documents in one atomic call?",
    options: ["insertMany()", "insertOne()", "bulkWrite()", "insertAll()"],
    correctAnswer: "insertMany()",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "sql-3",
    category: "sql",
    courseTag: "SQL & Databases",
    questionText: "What does ACID stand for in relational database management systems?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Authentication, Consistency, Integrity, Data",
      "Automatic, Cache, Index, Distribution",
      "Array, Collection, Interface, Document"
    ],
    correctAnswer: "Atomicity, Consistency, Isolation, Durability",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "sql-4",
    category: "sql",
    courseTag: "SQL & Databases",
    questionText: "Which index type in MongoDB enables efficient text query lookups on string content?",
    options: ["Text Index", "2dsphere Index", "Hashed Index", "TTL Index"],
    correctAnswer: "Text Index",
    difficulty: "Medium",
    marks: 1
  },

  // ==================== DSA & ALGORITHMS ====================
  {
    id: "dsa-1",
    category: "dsa",
    courseTag: "Data Structures & Algorithms",
    questionText: "What is the average time complexity of lookup in a Hash Table?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: "O(1)",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "dsa-2",
    category: "dsa",
    courseTag: "Data Structures & Algorithms",
    questionText: "Which data structure operates strictly under the First-In-First-Out (FIFO) principle?",
    options: ["Queue", "Stack", "Binary Heap", "Trie"],
    correctAnswer: "Queue",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "dsa-3",
    category: "dsa",
    courseTag: "Data Structures & Algorithms",
    questionText: "What is the worst-case time complexity of QuickSort?",
    options: ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"],
    correctAnswer: "O(n^2)",
    difficulty: "Medium",
    marks: 1
  },
  {
    id: "dsa-4",
    category: "dsa",
    courseTag: "Data Structures & Algorithms",
    questionText: "Which traversal algorithm for graphs utilizes a Queue data structure?",
    options: [
      "Breadth-First Search (BFS)",
      "Depth-First Search (DFS)",
      "Dijkstra's with Array",
      "Topological Sort with Recursion"
    ],
    correctAnswer: "Breadth-First Search (BFS)",
    difficulty: "Medium",
    marks: 1
  },

  // ==================== WEB DEV & NODE.JS ====================
  {
    id: "web-1",
    category: "webdev",
    courseTag: "Web Development",
    questionText: "What does the CSS property `box-sizing: border-box` do?",
    options: [
      "Includes padding and border within the element's total width and height calculation",
      "Removes all borders from the box model",
      "Forces elements to display as inline blocks",
      "Adds an automatic drop shadow to boxes"
    ],
    correctAnswer: "Includes padding and border within the element's total width and height calculation",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "web-2",
    category: "webdev",
    courseTag: "Web Development",
    questionText: "In Express.js, which built-in middleware parses incoming JSON request payloads?",
    options: ["express.json()", "express.urlencoded()", "express.bodyParser()", "express.static()"],
    correctAnswer: "express.json()",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "web-3",
    category: "webdev",
    courseTag: "Web Development",
    questionText: "What does HTTP status code 201 signify?",
    options: [
      "Created: Request succeeded and led to the creation of a new resource",
      "OK: Standard response for successful requests",
      "Accepted: Request accepted for processing but not completed",
      "No Content: Request succeeded but returns no content"
    ],
    correctAnswer: "Created: Request succeeded and led to the creation of a new resource",
    difficulty: "Easy",
    marks: 1
  },
  {
    id: "web-4",
    category: "webdev",
    courseTag: "Web Development",
    questionText: "What is CORS in web application architecture?",
    options: [
      "Cross-Origin Resource Sharing: A security mechanism for managing cross-domain requests",
      "Computer Operating Resource System",
      "Centralized Object Relational Server",
      "Client Origin Routing Service"
    ],
    correctAnswer: "Cross-Origin Resource Sharing: A security mechanism for managing cross-domain requests",
    difficulty: "Medium",
    marks: 1
  }
];

/**
 * Filter suggestions dynamically by course name, category, or search term
 */
export function getSuggestions(courseName = "", categoryFilter = "all", searchQuery = "") {
  const normCourse = String(courseName || "").toLowerCase().trim();
  const normSearch = String(searchQuery || "").toLowerCase().trim();

  // Find category matching course name if courseName is provided
  let detectedCategory = null;
  if (normCourse) {
    for (const cat of QUESTION_CATEGORIES) {
      if (cat.id === "all") continue;
      if (
        normCourse.includes(cat.id) ||
        cat.keywords?.some((kw) => normCourse.includes(kw)) ||
        normCourse.includes(cat.label.toLowerCase())
      ) {
        detectedCategory = cat.id;
        break;
      }
    }
  }

  return SUGGESTED_QUESTIONS.filter((q) => {
    // Category match
    const matchesCategory =
      categoryFilter === "all"
        ? detectedCategory
          ? q.category === detectedCategory
          : true
        : q.category === categoryFilter;

    // Search query match
    const matchesSearch =
      !normSearch ||
      q.questionText.toLowerCase().includes(normSearch) ||
      q.options.some((o) => o.toLowerCase().includes(normSearch)) ||
      q.courseTag.toLowerCase().includes(normSearch);

    return matchesCategory && matchesSearch;
  });
}
