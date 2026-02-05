const fs = require("fs");
const path = require("path");

// Configuration
const csvPath = path.join(__dirname, "../asset/AAv.csv");
const sqlPath = path.join(__dirname, "seeded_data_v2.sql"); // Unified seeder for v2 schema

/**
 * Excel represents integers as dates (01/01/1900 = 1).
 * This function converts date-formatted integers back to numbers.
 */
function cleanValue(val) {
  if (!val || val === "NULL" || val === "" || val === '""') return null;
  val = val.replace(/^"|"$/g, "").trim();

  const dateMatch = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dateMatch) {
    const [_, d, m, y] = dateMatch;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);
    const dt = new Date(Date.UTC(year, month - 1, day));
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const diffDays = Math.round((dt - excelEpoch) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 100000) return diffDays;
  }

  const parsedNum = parseInt(val, 10);
  if (!isNaN(parsedNum) && String(parsedNum) === val) return parsedNum;

  return val;
}

function escape(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return val;
  return `'${String(val).replace(/'/g, "''")}'`;
}

const rawData = fs.readFileSync(csvPath, "utf8");
const lines = rawData.split(/\r?\n/);

// Data structure following schema_v2.sql
const tables = {
  centre: [],
  department: [],
  program: [],
  course: [],
  staff: [],
  student: [],
  venue: [],
  registration: [],
  users: [],
  system_settings: [],
};

let currentSection = "";
const seenMatrics = new Set();
const seenCourses = new Set();
const seenStaff = new Set();
const validCentres = new Set();
const validDepts = new Set();
const validPrograms = new Set();

console.log("DBA: Processing CSV for Schema v2 Compliance...");

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const rawCols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  if (rawCols.length < 2) continue;

  const cols = rawCols.map((c) => cleanValue(c));
  const first = String(rawCols[0] || "")
    .toLowerCase()
    .replace(/^"|"$/g, "");
  const second = String(rawCols[1] || "")
    .toLowerCase()
    .replace(/^"|"$/g, "");

  // SECTION DETECTION
  if (
    first === "id" &&
    second === "code" &&
    String(rawCols[2]).toLowerCase().includes("name")
  ) {
    currentSection = "CENTRE";
    continue;
  }
  if (
    first === "id" &&
    second === "name" &&
    String(rawCols[3]).toLowerCase().includes("collegeid")
  ) {
    currentSection = "DEPT";
    continue;
  }
  if (
    first === "id" &&
    second === "name" &&
    String(rawCols[9]).toLowerCase().includes("deptid")
  ) {
    currentSection = "PROG";
    continue;
  }
  if (first === "code" && second === "title") {
    currentSection = "COURSE";
    continue;
  }
  if (first === "serial" && second === "staffid") {
    currentSection = "STAFF";
    continue;
  }
  if (first === "matricno" && second === "fullname") {
    currentSection = "STUDENT";
    continue;
  }
  if (first === "id" && (rawCols[2] || "").toLowerCase().includes("vcode")) {
    currentSection = "VENUE";
    continue;
  }
  if (
    first === "id" &&
    second === "collegeid" &&
    String(rawCols[4]).toLowerCase().includes("matricno")
  ) {
    currentSection = "REG";
    continue;
  }

  try {
    if (currentSection === "CENTRE") {
      const id = cols[0];
      if (typeof id !== "number") continue;
      tables.centre.push(
        `(${id}, ${escape(cols[1])}, ${escape(cols[2])}, 1, 0)`,
      );
      validCentres.add(id);
    } else if (currentSection === "DEPT") {
      const id = cols[0];
      if (typeof id !== "number") continue;
      const collId = validCentres.has(cols[3]) ? cols[3] : 1;
      tables.department.push(
        `(${id}, ${escape(cols[1])}, ${escape(cols[2])}, ${collId})`,
      );
      validDepts.add(id);
    } else if (currentSection === "PROG") {
      const id = cols[0];
      if (typeof id !== "number") continue;
      const deptId = validDepts.has(cols[9]) ? cols[9] : 1;
      tables.program.push(
        `(${id}, ${escape(cols[1])}, ${escape(cols[2])}, ${deptId}, 0)`,
      );
      validPrograms.add(id);
    } else if (currentSection === "COURSE") {
      const code = cols[0];
      if (!code || code === "code" || seenCourses.has(code)) continue;
      const collId = validCentres.has(cols[6]) ? cols[6] : 1;
      const deptId = validDepts.has(cols[7])
        ? cols[7]
        : validDepts.keys().next().value || 1;
      tables.course.push(
        `(${escape(code)}, ${escape(cols[1])}, ${cols[2] || 3}, ${cols[3] === 2 ? 2 : 1}, 2, 0, ${collId}, ${deptId})`,
      );
      seenCourses.add(code);
    } else if (currentSection === "STAFF") {
      const staffId = String(cols[1]);
      if (!staffId || staffId === "StaffID" || seenStaff.has(staffId)) continue;
      const firstN = cols[3] || "Staff";
      const surN = cols[5] || (cols[6] ? cols[6].split(" ")[1] : "Member");
      const deptId = validDepts.has(cols[9]) ? cols[9] : 1;
      tables.staff.push(
        `(${escape(staffId)}, ${escape(cols[2])}, ${escape(surN)}, ${escape(firstN)}, ${escape(cols[4])}, ${deptId}, 1, 1, 1, 0, NULL)`,
      );
      seenStaff.add(staffId);
    } else if (currentSection === "STUDENT") {
      const matric = String(cols[0]);
      if (!matric || matric === "matricNo" || seenMatrics.has(matric)) continue;
      const names = String(cols[1] || "").split(/\s+/);
      const deptId = validDepts.has(cols[3]) ? cols[3] : 1;
      const progId = validPrograms.has(cols[4]) ? cols[4] : null;
      tables.student.push(
        `(${escape(matric)}, ${escape(names[0] || "Student")}, ${escape(names[1] || "Name")}, ${escape(names.slice(2).join(" "))}, 'M', ${deptId}, ${escape(progId)}, '2023/2024', ${cols[5] || 100})`,
      );
      seenMatrics.add(matric);
    } else if (currentSection === "VENUE") {
      const id = cols[0];
      if (typeof id !== "number") continue;
      const collId = validCentres.has(cols[6]) ? cols[6] : 1;
      tables.venue.push(
        `(${id}, ${escape(cols[2])}, ${escape(cols[1])}, ${cols[4] || 100}, 0, ${collId}, ${cols[8] || 1}, ${escape(cols[1])})`,
      );
    } else if (currentSection === "REG") {
      const matric = String(cols[4]);
      const course = String(cols[5]);
      if (seenMatrics.has(matric) && seenCourses.has(course)) {
        tables.registration.push(
          `(NULL, ${escape(matric)}, ${escape(course)}, ${escape(cols[2])}, ${cols[3] === 2 ? 2 : 1}, ${cols[1] || 1})`,
        );
      }
    }
  } catch (e) {}
}

// System initialization
tables.system_settings.push(`('academic_session', '2023/2024', 'academic')`);
tables.system_settings.push(`('current_semester', '1', 'academic')`);
tables.users.push(`(1, 'uche', 'uche_hashed_pw', 'ADMIN', NULL, 1, 1)`); // Logic for uche user

// SQL Generation
let sql = `-- Refactored Seeder Script (v2)\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;
const schemaOrder = [
  "system_settings",
  "users",
  "registration",
  "course",
  "staff",
  "student",
  "program",
  "venue",
  "department",
  "centre",
];
schemaOrder.forEach((t) => (sql += `TRUNCATE TABLE \`${t}\`;\n`));
sql += `\n`;

const generateInsert = (table, columns, items) => {
  if (items.length === 0) return "";
  let out = "";
  const unique = [...new Set(items)];
  const size = 500;
  for (let i = 0; i < unique.length; i += size) {
    out +=
      `INSERT INTO \`${table}\` (${columns}) VALUES\n` +
      unique.slice(i, i + size).join(",\n") +
      ";\n\n";
  }
  return out;
};

sql += generateInsert(
  "centre",
  "`id`, `code`, `name`, `type`, `encount`",
  tables.centre,
);
sql += generateInsert(
  "department",
  "`id`, `name`, `code`, `college_id`",
  tables.department,
);
sql += generateInsert(
  "program",
  "`id`, `name`, `code`, `dept_id`, `new_codeid`",
  tables.program,
);
sql += generateInsert(
  "venue",
  "`id`, `venue_code`, `name`, `capacity`, `type`, `college_id`, `preference_rank`, `location_note`",
  tables.venue,
);
sql += generateInsert(
  "student",
  "`matric_no`, `surname`, `firstname`, `middlename`, `gender`, `dept_id`, `program_id`, `start_session`, `current_level`",
  tables.student,
);
sql += generateInsert(
  "staff",
  "`staff_id`, `title`, `surname`, `firstname`, `middlename`, `dept_id`, `status_id`, `staff_type`, `is_active`, `duty_count`, `specialization`",
  tables.staff,
);
sql += generateInsert(
  "course",
  "`code`, `title`, `unit`, `semester`, `exam_type`, `en_count`, `college_id`, `dept_id`",
  tables.course,
);
sql += generateInsert(
  "registration",
  "`id`, `matric_no`, `course_code`, `session`, `semester`, `college_id`",
  tables.registration,
);
sql += generateInsert(
  "users",
  "`id`, `username`, `password`, `role`, `staff_id`, `dept_id`, `college_id`",
  tables.users,
);
sql += generateInsert(
  "system_settings",
  "`setting_key`, `setting_value`, `category`",
  tables.system_settings,
);

sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
fs.writeFileSync(sqlPath, sql);
console.log(`DBA: Success! Clean seeder generated at ${sqlPath}.`);
console.log(
  `Integrity Check: ${tables.student.length} Students, ${tables.course.length} Courses, ${tables.registration.length} Verified Registrations.`,
);
