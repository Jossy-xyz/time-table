const fs = require("fs");
const path = require("path");

const assetDir = path.join(__dirname, "../asset");
const files = fs.readdirSync(assetDir);
const untitledFile = files.find((f) => f.includes("Untitled"));

if (!untitledFile) {
  console.error("Critical: Could not find Untitled source file.");
  process.exit(1);
}

const csvPath = path.join(assetDir, untitledFile);
const sqlPath = path.join(__dirname, "seed_data.sql");

// Excel date decoder
function decodeExcelDate(val) {
  if (!val) return "";
  const dateMatch = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dateMatch) {
    const [_, d, m, y] = dateMatch;
    const dt = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(d)));
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const diffDays = Math.round((dt - excelEpoch) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 100000) return String(diffDays);
  }
  return val;
}

function escape(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  if (typeof val === "number") return val;
  return `'${String(val).replace(/'/g, "''")}'`;
}

console.log(`DBA: Processing ${untitledFile} with FK INTEGRITY mapping...`);
const rawData = fs.readFileSync(csvPath, "utf8");
const rawLines = rawData.replace(/\r/g, "").split("\n");

// Clean and decode
const cleanedData = rawLines
  .map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    const cols = trimmed.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return cols.map((col) => {
      let val = col.replace(/^"|"$/g, "").trim();
      if (val === "NULL") return "";
      return decodeExcelDate(val);
    });
  })
  .filter((line) => line !== null);

const tables = {
  centre: [],
  department: [],
  program: [],
  course: [],
  staff: [],
  student: [],
  registration: [],
  venue: [],
  users: [],
};

// FK Lookups
const deptToCollege = new Map();
const programToDept = new Map();
const validColleges = new Set();
const seenMatrics = new Set();
const seenCourses = new Set();
const seenStaff = new Set();

let currentSection = "";

// PASS 1: Build Lookups & Extract Entities
cleanedData.forEach((cols) => {
  const header = cols.join(",").toLowerCase();

  // HEADING DETECTION
  if (header.includes("id,code,name") && header.includes("state")) {
    currentSection = "CENTRE";
    return;
  }
  if (
    header.includes("id,name,code,collegeid") &&
    !header.includes("duration")
  ) {
    currentSection = "DEPARTMENT";
    return;
  }
  if (
    header.includes("id,name,code") &&
    header.includes("duration") &&
    header.includes("deptid")
  ) {
    currentSection = "PROGRAM";
    return;
  }
  if (header.includes("id,name,vcode,capacity")) {
    currentSection = "VENUE";
    return;
  }
  if (
    header.includes("code,title,unit,semester") &&
    header.includes("encount")
  ) {
    currentSection = "COURSE";
    return;
  }
  if (header.includes("serial,staffid,title,firstname")) {
    currentSection = "STAFF";
    return;
  }
  if (header.includes("matricno,fullname,programme,deptid")) {
    currentSection = "STUDENT";
    return;
  }
  if (header.includes("id,collegeid,session,semester,matricno,coursecode")) {
    currentSection = "REGISTRATION";
    return;
  }
  if (header.includes("staffid,roleid,password,email")) {
    currentSection = "USERS";
    return;
  }

  if (
    header.includes("optimizationtime") ||
    header.includes("venueselectionpolicy") ||
    header.includes("id,codes,type,sem")
  ) {
    currentSection = "SKIP";
    return;
  }

  try {
    if (currentSection === "CENTRE" && !isNaN(cols[0]) && cols[0] !== "") {
      const id = parseInt(cols[0]);
      validColleges.add(id);
      tables.centre.push(
        `(${id}, ${escape(cols[1])}, ${escape(cols[2])}, 1, 0, ${escape(cols[3])})`,
      );
    } else if (
      currentSection === "DEPARTMENT" &&
      !isNaN(cols[0]) &&
      cols[0] !== ""
    ) {
      const deptId = parseInt(cols[0]);
      const collegeId = parseInt(cols[3]) || 1;
      deptToCollege.set(deptId, collegeId);
      tables.department.push(
        `(${deptId}, ${collegeId}, ${escape(cols[2])}, ${escape(cols[1])})`,
      );
    } else if (
      currentSection === "PROGRAM" &&
      !isNaN(cols[0]) &&
      cols[0] !== ""
    ) {
      const progId = parseInt(cols[0]);
      const deptId = parseInt(cols[9]) || 1;
      programToDept.set(progId, deptId);
      const duration = cols[3] || 4;
      const tComp = cols[4] || 0;
      const tReq = cols[5] || 0;
      const minE = cols[6] || 0;
      const entry = cols[7] || "";

      tables.program.push(
        `(${progId}, ${deptId}, ${escape(cols[2])}, ${escape(cols[1])}, ${cols[8] || 0}, ${duration}, ${tComp}, ${tReq}, ${minE}, ${escape(entry)})`,
      );
    } else if (currentSection === "COURSE") {
      if (
        !cols[0] ||
        cols[0].toLowerCase() === "code" ||
        seenCourses.has(cols[0])
      )
        return;
      if (cols[0].includes("/")) return;

      tables.course.push(
        `(NULL, 1, 1, ${escape(cols[0])}, ${escape(cols[1])}, ${cols[2] || 3}, ${cols[3] || 1}, 2, ${cols[4] || 0}, ${cols[5] || 0}, ${cols[6] || 0}, ${cols[7] || 0})`,
      );
      seenCourses.add(cols[0]);
    } else if (currentSection === "STAFF") {
      const sId = String(cols[1]);
      if (!sId || sId.toLowerCase() === "staffid" || seenStaff.has(sId)) return;
      if (!sId.includes("/")) return;

      const sur = cols[5] || "Staff";
      const first = cols[3] || "Name";
      const collegeId = parseInt(cols[9]) || 1;

      let dept_id = 1;
      for (let [dId, cId] of deptToCollege.entries()) {
        if (cId === collegeId) {
          dept_id = dId;
          break;
        }
      }

      tables.staff.push(
        `(NULL, ${dept_id}, ${escape(sId)}, ${escape(cols[2])}, ${escape(sur)}, ${escape(first)}, ${escape(cols[4])}, ${cols[7] || 1}, 1, ${cols[8] || 1}, ${cols[10] || 0}, NULL, NULL, NULL, ${escape(cols[6])}, ${cols[0] || 0})`,
      );
      seenStaff.add(sId);
    } else if (currentSection === "STUDENT") {
      const mat = String(cols[0]);
      if (!mat || mat.toLowerCase() === "matricno" || seenMatrics.has(mat))
        return;
      if (!mat.includes("/")) return;

      const names = String(cols[1] || "Student Name").split(/\s+/);
      const deptId = parseInt(cols[3]) || 1;

      let program_id = null;
      for (let [pId, dId] of programToDept.entries()) {
        if (dId === deptId) {
          program_id = pId;
          break;
        }
      }

      tables.student.push(
        `(NULL, ${deptId}, ${program_id}, ${escape(mat)}, ${escape(names[0])}, ${escape(names[1] || "")}, ${escape(names.slice(2).join(" "))}, 'M', '2023/2024', ${cols[5] || 100}, ${escape(cols[2])})`,
      );
      seenMatrics.add(mat);
    } else if (
      currentSection === "VENUE" &&
      !isNaN(cols[0]) &&
      cols[0] !== ""
    ) {
      tables.venue.push(
        `(NULL, ${cols[6] || 1}, ${escape(cols[2])}, ${escape(cols[1])}, ${cols[3] || 100}, ${cols[5] || 0}, ${cols[8] || 1}, ${escape(cols[1])}, ${cols[4] || 0}, ${cols[7] || 1})`,
      );
    }
  } catch (e) {}
});

// PASS 2: Registration & Users (Dependent Entities)
currentSection = "";
cleanedData.forEach((cols) => {
  const header = cols.join(",").toLowerCase();

  if (header.includes("id,collegeid,session,semester,matricno,coursecode")) {
    currentSection = "REGISTRATION";
    return;
  }
  if (header.includes("staffid,roleid,password,email")) {
    currentSection = "USERS";
    return;
  }
  if (header.includes("id,code,name") || header.includes("serial,staffid")) {
    currentSection = "STOP_REG";
    // We don't return here because we might hit Users later.
    // But based on PASS 1 logic, we set section.
  }

  if (currentSection === "REGISTRATION") {
    if (cols[0].toLowerCase() === "id" || cols[0] === "") return;
    const matric = String(cols[4]);
    const ccode = String(cols[5]);
    // VALIDATE BOTH STUDENT AND COURSE EXIST
    if (seenMatrics.has(matric) && seenCourses.has(ccode)) {
      tables.registration.push(
        `(NULL, ${cols[1] || 1}, ${cols[0] || 0}, ${escape(cols[4])}, ${escape(cols[5])}, ${escape(cols[2])}, ${cols[3] === "2" ? 2 : 1})`,
      );
    }
  } else if (currentSection === "USERS") {
    const sId = String(cols[0]);
    if (!sId || sId.toLowerCase() === "staffid") return;

    // VALIDATE STAFF EXISTS
    if (seenStaff.has(sId)) {
      const role = cols[1] === "1" ? "ADMIN" : "STAFF";
      // Attempt to find college and dept for this staff
      // Note: Staff extraction already uses first matching dept
      let dept_id = 1;
      let college_id = 1;

      // This is a bit complex as staff doesn't store college_id in schema Level 1
      // We'll use the first match or default
      tables.users.push(
        `(NULL, ${escape(sId)}, ${escape(cols[2])}, '${role}', 1, 1, ${escape(sId)}, ${escape(cols[3])})`,
      );
    }
  }
});

// SQL GENERATION
const adminUser = `INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`role\`, \`college_id\`, \`department_id\`, \`staff_id\`) VALUES (1, 'admin', 'admin', 'ADMIN', 1, 1, 'BUT/1');\n`;
let sql = `-- DBA FK-Integrated Seed File\nUSE \`examtt\`;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

const deleteOrder = [
  "registration",
  "users",
  "student",
  "staff",
  "course",
  "venue",
  "program",
  "department",
  "centre",
  "algorithm tab",
  "constraint table",
  "optimization settings",
  "output tab",
  "main interface",
  "examtab",
];
deleteOrder.forEach((t) => (sql += `DELETE FROM \`${t}\`;\n`));
sql += `\n` + adminUser + `\n`;

const dump = (table, columns, items) => {
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

sql += dump(
  "centre",
  "`id`, `code`, `name`, `type`, `encount`, `state`",
  tables.centre,
);
sql += dump(
  "department",
  "`id`, `college_id`, `code`, `name`",
  tables.department,
);
sql += dump(
  "program",
  "`id`, `dept_id`, `code`, `name`, `new_codeid`, `duration`, `total_comp_units`, `total_req_units`, `min_elective_units`, `entry_req`",
  tables.program,
);
sql += dump(
  "venue",
  "`id`, `college_id`, `venue_code`, `name`, `Capacity`, `Type`, `Preference`, `location`, `actual_capacity`, `in_use`",
  tables.venue,
);
sql += dump(
  "course",
  "`id`, `college_id`, `dept_id`, `code`, `title`, `unit`, `semester`, `examtype`, `en_count`, `lecture_hours`, `tutorial_hours`, `practical_hours`",
  tables.course,
);
sql += dump(
  "staff",
  "`id`, `dept_id`, `staff_id`, `title`, `surname`, `firstname`, `middlename`, `statusID`, `type`, `in_use`, `duty_count`, `specialization`, `research_area`, `discipline`, `short_name`, `serial_no`",
  tables.staff,
);
sql += dump(
  "student",
  "`Id`, `dept_id`, `program_id`, `matric_no`, `surname`, `firstname`, `middlename`, `gender`, `start_session`, `level`, `programme_name`",
  tables.student,
);
sql += dump(
  "registration",
  "`id`, `centre_id`, `regDMC`, `matricno`, `course_code`, `session`, `semester`",
  tables.registration,
);
sql += dump(
  "users",
  "`id`, `username`, `password`, `role`, `college_id`, `department_id`, `staff_id`, `email`",
  tables.users,
);

// Default settings
sql += `INSERT INTO \`optimization settings\` (id, display_progress, opt_time, opt_cycle_count) VALUES (1, 1, '60', 100);\n`;
sql += `INSERT INTO \`output tab\` (id, students_per_staff) VALUES (1, 50);\n`;
sql += `INSERT INTO \`main interface\` (id, session, semester) VALUES (1, '2023/2024', 'First');\n`;

sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
fs.writeFileSync(sqlPath, sql);

console.log(`\nDBA: FK-INTEGRATED SEED COMPLETE!`);
console.log(
  `- Registrations validated against Students & Courses: ${tables.registration.length}`,
);
console.log(`- Users validated against Staff: ${tables.users.length}`);
