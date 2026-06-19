import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import "./StudentManagement.css";

const STORAGE_KEY = "student-management-data";
const EMPTY_FORM = { name: "", age: "", major: "" };
const MAJORS = [
  "Information technology",
  "Business administration",
  "Marketing",
  "Software engineering",
];

const initialStudents = [
  {
    id: "Student1",
    name: "Minh Truong",
    age: "20",
    major: "Information technology",
  },
  {
    id: "Student2",
    name: "Son Tung",
    age: "20",
    major: "Business administration",
  },
];

const ThemeContext = createContext(null);

function reducer(students, action) {
  if (action.type === "ADD_STUDENT") return [...students, action.student];
  if (action.type === "DELETE_STUDENT")
    return students.filter(({ id }) => id !== action.id);
  if (action.type === "UPDATE_STUDENT") {
    return students.map((student) =>
      student.id === action.student.id ? action.student : student,
    );
  }
  return students;
}

function loadStudents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialStudents;
  } catch {
    return initialStudents;
  }
}

function nextId(students) {
  const numbers = students.map(
    ({ id }) => Number(String(id).replace("Student", "")) || 0,
  );
  return `Student${Math.max(0, ...numbers) + 1}`;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const value = {
    theme,
    toggleTheme: () =>
      setTheme((current) => (current === "light" ? "dark" : "light")),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

function StudentManagementView() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [students, dispatch] = useReducer(
    reducer,
    initialStudents,
    loadStudents,
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [majorFilter, setMajorFilter] = useState("All majors");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  const visibleStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return students.filter((student) => {
      const byName = student.name.toLowerCase().includes(keyword);
      const byMajor =
        majorFilter === "All majors" || student.major === majorFilter;
      return byName && byMajor;
    });
  }, [students, search, majorFilter]);

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const clearForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const saveStudent = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.age.trim() || !form.major) return;

    const student = {
      id: editingId || nextId(students),
      name: form.name.trim(),
      age: form.age.trim(),
      major: form.major,
    };

    dispatch({ type: editingId ? "UPDATE_STUDENT" : "ADD_STUDENT", student });
    clearForm();
  };

  const editStudent = (student) => {
    setEditingId(student.id);
    setForm({ name: student.name, age: student.age, major: student.major });
  };

  const deleteStudent = (id) => {
    dispatch({ type: "DELETE_STUDENT", id });
    if (editingId === id) clearForm();
  };

  return (
    <main className={`student-app ${theme}`}>
      <section className="manager-shell">
        <header className="manager-header">
          <div>
            <h1>Student Management</h1>
          </div>
          <button className="theme-toggle" type="button" onClick={toggleTheme}>
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
        </header>

        <form className="student-panel" onSubmit={saveStudent}>
          <input
            name="name"
            placeholder="Student name"
            value={form.name}
            onChange={updateForm}
          />
          <input
            name="age"
            min="1"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={updateForm}
          />
          <select name="major" value={form.major} onChange={updateForm}>
            <option value="">Select major</option>
            {MAJORS.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
          <button className="primary-button" type="submit">
            {editingId ? "Save changes" : "Add student"}
          </button>
          {editingId && (
            <button className="ghost-button" type="button" onClick={clearForm}>
              Cancel
            </button>
          )}
        </form>

        <div className="toolbar">
          <input
            type="search"
            placeholder="Search by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            value={majorFilter}
            onChange={(event) => setMajorFilter(event.target.value)}
          >
            <option>All majors</option>
            {MAJORS.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
        </div>

        <div className="student-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Major</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.age}</td>
                  <td>{student.major}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        onClick={() => editStudent(student)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteStudent(student.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!visibleStudents.length && (
                <tr>
                  <td className="empty-message" colSpan="5">
                    No students match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <strong style={{ marginTop: "20px" }}>
          Total shown: {visibleStudents.length}
        </strong>
      </section>
    </main>
  );
}

export default function StudentManagement() {
  return (
    <ThemeProvider>
      <StudentManagementView />
    </ThemeProvider>
  );
}
