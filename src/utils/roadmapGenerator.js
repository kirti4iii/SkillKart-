
const roadmapTemplates = {
    "Web Development": {
      title: "Web Development Roadmap",
      duration: 10, // weeks
      modules: [
        {
          week: 1,
          title: "HTML Fundamentals",
          description: "Learn the building blocks of web pages",
          topics: [
            { name: "HTML Document Structure", status: "not-started" },
            { name: "HTML Tags and Elements", status: "not-started" },
            { name: "Forms and Input Elements", status: "not-started" }
          ],
          resources: [
            { type: "video", title: "HTML Crash Course", url: "https://example.com/html-crash-course" },
            { type: "blog", title: "HTML Best Practices", url: "https://example.com/html-best-practices" },
            { type: "quiz", title: "HTML Basics Quiz", url: "https://example.com/html-quiz" }
          ]
        },
        {
          week: 2,
          title: "CSS Styling",
          description: "Style your web pages with CSS",
          topics: [
            { name: "CSS Selectors", status: "not-started" },
            { name: "Box Model", status: "not-started" },
            { name: "Flexbox Layout", status: "not-started" }
          ],
          resources: [
            { type: "video", title: "CSS Fundamentals", url: "https://example.com/css-fundamentals" },
            { type: "blog", title: "CSS Layouts Explained", url: "https://example.com/css-layouts" },
            { type: "quiz", title: "CSS Challenge", url: "https://example.com/css-quiz" }
          ]
        },
        {
          week: 3,
          title: "JavaScript Basics",
          description: "Add interactivity to your websites",
          topics: [
            { name: "Variables and Data Types", status: "not-started" },
            { name: "Functions and Control Flow", status: "not-started" },
            { name: "DOM Manipulation", status: "not-started" }
          ],
          resources: [
            { type: "video", title: "JavaScript for Beginners", url: "https://example.com/js-beginners" },
            { type: "blog", title: "JavaScript Core Concepts", url: "https://example.com/js-concepts" },
            { type: "quiz", title: "JavaScript Quiz", url: "https://example.com/js-quiz" }
          ]
        }
      ]
    },
    "UI/UX Design": {
      title: "UI/UX Design Roadmap",
      duration: 8, // weeks
      modules: [
        {
          week: 1,
          title: "Design Fundamentals",
          description: "Learn the basics of visual design",
          topics: [
            { name: "Color Theory", status: "not-started" },
            { name: "Typography", status: "not-started" },
            { name: "Layout Principles", status: "not-started" }
          ],
          resources: [
            { type: "video", title: "Design Basics", url: "https://example.com/design-basics" },
            { type: "blog", title: "Color Theory Explained", url: "https://example.com/color-theory" },
            { type: "quiz", title: "Design Principles Quiz", url: "https://example.com/design-quiz" }
          ]
        },
        {
          week: 2,
          title: "User Research",
          description: "Understand your users' needs",
          topics: [
            { name: "User Personas", status: "not-started" },
            { name: "User Journey Mapping", status: "not-started" },
            { name: "Usability Testing", status: "not-started" }
          ],
          resources: [
            { type: "video", title: "User Research Methods", url: "https://example.com/user-research" },
            { type: "blog", title: "Creating Effective Personas", url: "https://example.com/personas" },
            { type: "quiz", title: "Research Methods Quiz", url: "https://example.com/research-quiz" }
          ]
        }
      ]
    },
    "Data Science": {
      title: "Data Science Roadmap",
      duration: 12, // weeks
      modules: [
        {
          week: 1,
          title: "Python Basics",
          description: "Learn Python for data analysis",
          topics: [
            { name: "Python Syntax", status: "not-started" },
            { name: "Data Structures", status: "not-started" },
            { name: "Functions and Modules", status: "not-started" }
          ],
          resources: [
            { type: "video", title: "Python for Data Science", url: "https://example.com/python-data" },
            { type: "blog", title: "Python Data Analysis", url: "https://example.com/python-analysis" },
            { type: "quiz", title: "Python Basics Quiz", url: "https://example.com/python-quiz" }
          ]
        },
        {
          week: 2,
          title: "Data Analysis with Pandas",
          description: "Analyze data with Python's Pandas library",
          topics: [
            { name: "DataFrames", status: "not-started" },
            { name: "Data Cleaning", status: "not-started" },
            { name: "Data Visualization", status: "not-started" }
          ],
          resources: [
            { type: "video", title: "Pandas Fundamentals", url: "https://example.com/pandas-fundamentals" },
            { type: "blog", title: "Data Cleaning with Pandas", url: "https://example.com/pandas-cleaning" },
            { type: "quiz", title: "Pandas Challenge", url: "https://example.com/pandas-quiz" }
          ]
        }
      ]
    }
  };
  
  export function generateRoadmap(skill, weeklyTime) {
    const template = roadmapTemplates[skill];
    
    if (!template) {
      return null;
    }
    
    // Adjust roadmap based on available weekly time
    let adjustedRoadmap = {...template};
    
    // If user has less time available, extend the duration
    if (weeklyTime < 5) {
      adjustedRoadmap.duration = Math.ceil(template.duration * (5 / weeklyTime));
    }
    // If user has more time, compress the duration (but not too much)
    else if (weeklyTime > 10) {
      adjustedRoadmap.duration = Math.max(Math.floor(template.duration * (10 / weeklyTime)), template.duration / 2);
    }
    
    return adjustedRoadmap;
  }
  
  export function getAvailableSkills() {
    return Object.keys(roadmapTemplates);
  }
  
  export default roadmapTemplates;