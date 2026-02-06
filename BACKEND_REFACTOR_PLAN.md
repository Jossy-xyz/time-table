# 🔧 BELLS UNIVERSITY TIMETABLE GENERATOR - COMPLETE BACKEND REFACTOR PLAN

## 📋 EXECUTIVE SUMMARY

Based on analysis of:

- **schema2.sql** (new normalized database schema)
- **Current SYSTEM.md** (system documentation with rules)
- **Existing Backend Code** (Spring Boot + JPA implementation)

### CRITICAL FINDINGS:

1. **Schema Mismatch**: Backend models are **completely out of sync** with schema2.sql
2. **No Authorization/Scope Enforcement**: Current implementation has **zero** Policy Enforcement Layer (PEL)
3. **No Database Interaction Verification (DIV)**: Services directly save without validation
4. **Plain Text Passwords**: Security vulnerability in authentication
5. **Broken Entity Relationships**: Models use primitive IDs instead of JPA relationships
6. **Missing Enrollment-First Logic**: Registration service doesn't verify `student_semester_registration`
7. **Constraint Table Model Mismatch**: Current model doesn't match schema2.sql structure

---

## 🎯 REFACTOR OBJECTIVES

### Phase 1: Database & Entity Layer (Foundation)

1. Align all JPA entities with schema2.sql
2. Establish proper FK relationships using JPA annotations
3. Implement audit fields (`created_at`, timestamps)
4. Add proper indexes and constraints

### Phase 2: Security & Authentication (Critical)

5. Implement BCrypt password hashing
6. Create JWT-based authentication
7. Build Policy Enforcement Layer (PEL)
8. Implement role-based scope resolution

### Phase 3: Service Layer Refactor (Business Logic)

9. Implement Database Interaction Verification (DIV)
10. Enforce Enrollment-First principle
11. Add transaction management
12. Implement comprehensive validation

### Phase 4: API Layer (Controller Standardization)

13. Standardize REST API responses
14. Add DTO layer for request/response
15. Implement global exception handling
16. Add API versioning

---

## 📦 PHASE 1: DATABASE & ENTITY LAYER REFACTOR

### 1.1 Entity Model Alignment with schema2.sql

#### 🔴 CRITICAL: Current Model Issues

**Registration.java** - Completely Wrong Structure:

```java
// CURRENT (WRONG):
@Entity
@Table(name = "registration")
public class Registration {
    @Id
    private int id;  // Should be BIGINT AUTO_INCREMENT
    private int regDMC;  // Doesn't exist in schema2.sql
    private int centreID;  // Doesn't exist in schema2.sql
    private String matricNO;  // Should be FK to student.id
    private String courseCode;  // Should be FK to course.id
    private String session;
    private int semester;
}
```

**CORRECT Structure (schema2.sql):**

```sql
CREATE TABLE registration (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,  -- FK to student
  session VARCHAR(20) NOT NULL,
  semester INT NOT NULL,
  course_id INT NOT NULL,  -- FK to course
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_course FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_enrollment FOREIGN KEY (student_id, session, semester)
    REFERENCES student_semester_registration(student_id, session, semester) ON DELETE CASCADE,
  UNIQUE(student_id, course_id, session)
);
```

#### 🛠️ Action Items for Each Entity:

| Entity              | Current State       | Required Changes                                                |
| ------------------- | ------------------- | --------------------------------------------------------------- |
| **Registration**    | ❌ Wrong schema     | Complete rewrite with FK relationships                          |
| **Student**         | ⚠️ Uses int IDs     | Add FK to Department, Program; add created_at                   |
| **Studentsemreg**   | ❌ Wrong table name | Rename to `StudentSemesterRegistration`; align with schema      |
| **Users**           | ⚠️ Partial FK       | Add staff_id FK; align role_id FK                               |
| **Constrainttable** | ❌ Wrong schema     | Rewrite with schema2.sql columns (periodIncE, periodExcE, etc.) |
| **Staff**           | ⚠️ Missing FK       | Add proper Department FK                                        |
| **Course**          | ⚠️ Missing FK       | Add proper Department FK                                        |
| **Venue**           | ⚠️ Missing FK       | Add proper Centre FK                                            |

---

### 1.2 New Entity Models (Priority Order)

#### ✅ 1. Centre Entity (Correct)

```java
@Entity
@Table(name = "centre")
public class Centre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer type;

    @Column(length = 100)
    private String state;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Relationships
    @OneToMany(mappedBy = "centre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Department> departments;

    @OneToMany(mappedBy = "centre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Venue> venues;

    // Getters and Setters
}
```

#### ✅ 2. Department Entity (Needs FK Fix)

```java
@Entity
@Table(name = "department")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id", nullable = false)
    private Centre centre;

    @Column(unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Relationships
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Program> programs;

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<Staff> staffMembers;

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<Course> courses;

    // Getters and Setters
}
```

#### ✅ 3. Registration Entity (COMPLETE REWRITE)

```java
@Entity
@Table(name = "registration", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id", "session"})
})
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // BIGINT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 20)
    private String session;

    @Column(nullable = false)
    private Integer semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Getters and Setters
}
```

#### ✅ 4. StudentSemesterRegistration Entity (COMPLETE REWRITE)

```java
@Entity
@Table(name = "student_semester_registration", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "session", "semester"})
})
public class StudentSemesterRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // BIGINT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 20)
    private String session;

    @Column(nullable = false)
    private Integer semester;

    @Column(columnDefinition = "INT DEFAULT 100")
    private Integer level;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Relationships
    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL)
    private List<Registration> courseRegistrations;

    // Getters and Setters
}
```

#### ✅ 5. Constraint Table Entity (COMPLETE REWRITE)

```java
@Entity
@Table(name = "constraint_table")
public class ConstraintTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "Date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date date;

    @Column(name = "periodIncE", length = 500)
    private String periodIncludeExam;  // e.g., CHM(0,1,2,3);ITP401(1,2)

    @Column(name = "periodExcE", length = 500)
    private String periodExcludeExam;  // e.g., ITP401(0,5,7);MTH101(3,4)

    @Column(name = "venueIncE", length = 500)
    private String venueIncludeExam;  // e.g., CHM101(VENUE);COS202(LAB201)

    @Column(name = "venueExcE", length = 500)
    private String venueExcludeExam;  // e.g., PHY301(HALL);BIO102(LAB102)

    @Column(name = "periodIncV", length = 500)
    private String periodIncludeVenue;  // e.g., LAB201(1,2);HALL301(0,3)

    @Column(name = "periodExcV", length = 500)
    private String periodExcludeVenue;  // e.g., LAB101(4,5);HALL201(2)

    @Column(name = "examWAftE", length = 500)
    private String examWeightAfter;  // e.g., MTH101,PHY101;CHM101,COS101

    @Column(name = "examExcE", length = 500)
    private String examExclude;  // e.g., PHY101,CHM101;MTH201,COS202

    @Column(name = "frontLE", length = 500)
    private String frontLoadExams;  // e.g., first exams to schedule

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        date = new Date();
    }

    // Getters and Setters
}
```

#### ✅ 6. Users Entity (SECURITY FIX)

```java
@Entity
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    @JsonIgnore
    private String password;  // BCrypt hashed

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id")
    private Centre college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @Column(length = 255)
    private String email;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Getters and Setters (NO password getter in response)
}
```

#### ✅ 7. Student Entity (FK Relationships)

```java
@Entity
@Table(name = "student")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private Program program;

    @Column(name = "matric_no", unique = true, nullable = false, length = 50)
    private String matricNo;

    @Column(nullable = false, length = 255)
    private String surname;

    @Column(nullable = false, length = 255)
    private String firstname;

    @Column(length = 255)
    private String middlename;

    @Column(length = 20)
    private String gender;

    @Column(name = "start_session", length = 20)
    private String startSession;

    @Column(columnDefinition = "INT DEFAULT 100")
    private Integer level;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Relationships
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<StudentSemesterRegistration> semesterRegistrations;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Registration> courseRegistrations;

    // Getters and Setters
}
```

#### ✅ 8. Course Entity (FK Relationships)

```java
@Entity
@Table(name = "course")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer unit;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer semester;

    @Column(name = "exam_type", columnDefinition = "INT DEFAULT 2")
    private Integer examType;

    @Column(name = "en_count", columnDefinition = "INT DEFAULT 0")
    private Integer enrollmentCount;

    @Column(name = "lecture_hours", columnDefinition = "INT DEFAULT 0")
    private Integer lectureHours;

    @Column(name = "tutorial_hours", columnDefinition = "INT DEFAULT 0")
    private Integer tutorialHours;

    @Column(name = "practical_hours", columnDefinition = "INT DEFAULT 0")
    private Integer practicalHours;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Relationships
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Registration> registrations;

    // Getters and Setters
}
```

#### ✅ 9. Staff Entity (FK Relationships)

```java
@Entity
@Table(name = "staff")
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "staff_id", unique = true, nullable = false, length = 50)
    private String staffId;

    @Column(nullable = false, length = 255)
    private String surname;

    @Column(nullable = false, length = 255)
    private String firstname;

    @Column(length = 255)
    private String middlename;

    @Column(name = "status_id", columnDefinition = "INT DEFAULT 1")
    private Integer statusId;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer type;

    @Column(name = "in_use", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean inUse;

    @Column(name = "duty_count", columnDefinition = "INT DEFAULT 0")
    private Integer dutyCount;

    @Column(length = 255)
    private String specialization;

    @Column(name = "research_area", length = 255)
    private String researchArea;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Getters and Setters
}
```

#### ✅ 10. Venue Entity (FK Relationships)

```java
@Entity
@Table(name = "venue")
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id", nullable = false)
    private Centre centre;

    @Column(name = "venue_code", unique = true, nullable = false, length = 50)
    private String venueCode;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false)
    private Integer capacity;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer type;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer preference;

    @Column(length = 255)
    private String location;

    @Column(name = "in_use", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean inUse;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Getters and Setters
}
```

#### ✅ 11. Program Entity (FK Relationships)

```java
@Entity
@Table(name = "program")
public class Program {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "INT DEFAULT 4")
    private Integer duration;

    @Column(name = "total_comp_units", columnDefinition = "INT DEFAULT 0")
    private Integer totalCompulsoryUnits;

    @Column(name = "total_req_units", columnDefinition = "INT DEFAULT 0")
    private Integer totalRequiredUnits;

    @Column(name = "min_elective_units", columnDefinition = "INT DEFAULT 0")
    private Integer minElectiveUnits;

    @Column(name = "entry_req", columnDefinition = "TEXT")
    private String entryRequirements;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Relationships
    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL)
    private List<Student> students;

    // Getters and Setters
}
```

#### ✅ 12. Role Entity (Access Control)

```java
@Entity
@Table(name = "role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false, length = 4)
    private String code;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Getters and Setters
}
```

---

## 📦 PHASE 2: SECURITY & AUTHENTICATION

### 2.1 Password Security

#### 🔐 BCrypt Password Encoder

```java
@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

#### 🔐 Updated User Service

```java
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Users registerUser(Users user) {
        // Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public Users authenticateUser(String username, String rawPassword) {
        Users user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return user;
    }
}
```

### 2.2 JWT Authentication

#### 🔑 Add Dependencies to pom.xml

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

#### 🔑 JWT Utility Class

```java
@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public String generateToken(Users user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().getCode());
        claims.put("collegeId", user.getCollege() != null ? user.getCollege().getId() : null);
        claims.put("departmentId", user.getDepartment() != null ? user.getDepartment().getId() : null);

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(user.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean validateToken(String token, Users user) {
        return extractUsername(token).equals(user.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }
}
```

#### 🔑 application.properties

```properties
jwt.secret=YourSecretKeyHere123456789012345678901234567890
jwt.expiration=86400000
```

### 2.3 Policy Enforcement Layer (PEL)

#### 🛡️ Scope Context DTO

```java
@Data
@Builder
public class ScopeContext {
    private String username;
    private String roleCode;
    private Integer collegeId;
    private Integer departmentId;

    public boolean isAdmin() {
        return "AD".equals(roleCode);
    }

    public boolean isCollegeRep() {
        return "CR".equals(roleCode);
    }

    public boolean isDepartmentRep() {
        return "DR".equals(roleCode);
    }

    public boolean isStaff() {
        return "ST".equals(roleCode);
    }
}
```

#### 🛡️ PEL Service

```java
@Service
public class PolicyEnforcementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    /**
     * Verify if actor has scope over target entity
     * @param actorUsername - who is performing the action
     * @param targetEntity - what entity (student, course, staff)
     * @param targetDepartmentId - department ID of target entity
     * @param operation - CREATE, READ, UPDATE, DELETE
     * @return true if allowed, false otherwise
     */
    public boolean hasScope(String actorUsername, String targetEntity, Integer targetDepartmentId, String operation) {
        Users actor = userRepository.findByUsername(actorUsername)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = actor.getRole();

        switch (role.getCode()) {
            case "AD":  // ADMIN - full access
                return true;

            case "CR":  // COLLEGE_REP - access to all departments in their college
                if (actor.getCollege() == null) return false;
                // Verify target department belongs to actor's college
                return isDepartmentInCollege(targetDepartmentId, actor.getCollege().getId());

            case "DR":  // DEPARTMENT_REP - access only to their department
                if (actor.getDepartment() == null) return false;
                return actor.getDepartment().getId().equals(targetDepartmentId);

            case "ST":  // STAFF - read-only access to their department
                if (actor.getDepartment() == null) return false;
                if (!operation.equals("READ")) return false;  // Only READ allowed
                return actor.getDepartment().getId().equals(targetDepartmentId);

            default:
                return false;
        }
    }

    private boolean isDepartmentInCollege(Integer deptId, Integer collegeId) {
        return departmentRepository.findById(deptId)
            .map(dept -> dept.getCentre().getId().equals(collegeId))
            .orElse(false);
    }

    /**
     * Extract actor's scope boundaries
     */
    public ScopeContext extractScope(String username) {
        Users actor = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return ScopeContext.builder()
            .username(username)
            .roleCode(actor.getRole().getCode())
            .collegeId(actor.getCollege() != null ? actor.getCollege().getId() : null)
            .departmentId(actor.getDepartment() != null ? actor.getDepartment().getId() : null)
            .build();
    }

    /**
     * Get accessible department IDs for actor
     */
    public List<Integer> getAccessibleDepartmentIds(String username) {
        ScopeContext scope = extractScope(username);

        if (scope.isAdmin()) {
            return departmentRepository.findAll().stream()
                .map(Department::getId)
                .collect(Collectors.toList());
        } else if (scope.isCollegeRep()) {
            return departmentRepository.findByCentreId(scope.getCollegeId()).stream()
                .map(Department::getId)
                .collect(Collectors.toList());
        } else if (scope.isDepartmentRep() || scope.isStaff()) {
            return Collections.singletonList(scope.getDepartmentId());
        }

        return Collections.emptyList();
    }
}
```

---

## 📦 PHASE 3: SERVICE LAYER REFACTOR

### 3.1 Database Interaction Verification (DIV)

#### 🔍 DIV Annotation

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface VerifyDatabaseInteraction {
    String operation();  // CREATE, UPDATE, DELETE
    String entity();     // Student, Course, Registration, etc.
}
```

#### 🔍 DIV Aspect (Optional - Advanced Implementation)

```java
@Aspect
@Component
public class DatabaseInteractionVerificationAspect {

    @Autowired
    private PolicyEnforcementService pelService;

    @Around("@annotation(verifyDatabaseInteraction)")
    public Object verifyBeforeExecution(ProceedingJoinPoint joinPoint, VerifyDatabaseInteraction verifyDatabaseInteraction) throws Throwable {

        // Extract actor from security context
        String actorUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // Extract target entity from method parameters
        Object[] args = joinPoint.getArgs();

        // Perform verification logic
        Integer targetDeptId = extractDepartmentId(args);

        if (!pelService.hasScope(actorUsername, verifyDatabaseInteraction.entity(), targetDeptId, verifyDatabaseInteraction.operation())) {
            throw new SecurityException("Access denied: insufficient scope");
        }

        // Proceed with method execution
        return joinPoint.proceed();
    }

    private Integer extractDepartmentId(Object[] args) {
        // Logic to extract department ID from entity
        for (Object arg : args) {
            if (arg instanceof Student) {
                return ((Student) arg).getDepartment().getId();
            } else if (arg instanceof Course) {
                return ((Course) arg).getDepartment().getId();
            }
            // Add more entity types as needed
        }
        return null;
    }
}
```

### 3.2 Registration Service with Enrollment-First Logic

#### ✅ Registration Repository

```java
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    boolean existsByStudentAndCourseAndSession(Student student, Course course, String session);
    List<Registration> findByStudent(Student student);
    List<Registration> findByStudentDepartmentId(Integer departmentId);
    List<Registration> findByStudentDepartmentCentreId(Integer centreId);
}
```

#### ✅ CORRECT Registration Service

```java
@Service
@Transactional
public class RegistrationServiceImpl implements RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private StudentSemesterRegistrationRepository semesterRegistrationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PolicyEnforcementService pelService;

    /**
     * ENROLLMENT-FIRST PRINCIPLE ENFORCED
     */
    @Override
    public Registration registerStudentForCourse(Integer studentId, Integer courseId, String session, Integer semester, String actorUsername) {

        // STEP 1: Verify student exists
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        // STEP 2: Verify course exists
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        // STEP 3: **ENROLLMENT-FIRST CHECK** - MANDATORY
        StudentSemesterRegistration enrollment = semesterRegistrationRepository
            .findByStudentAndSessionAndSemester(student, session, semester)
            .orElseThrow(() -> new RuntimeException("Student not enrolled for this session/semester. Must enroll first."));

        // STEP 4: Verify actor has scope over student's department
        if (!pelService.hasScope(actorUsername, "Registration", student.getDepartment().getId(), "CREATE")) {
            throw new SecurityException("Access denied: insufficient scope");
        }

        // STEP 5: Business Logic Validation
        // - Check if already registered
        if (registrationRepository.existsByStudentAndCourseAndSession(student, course, session)) {
            throw new RuntimeException("Student already registered for this course in this session");
        }

        // - Check if course belongs to same department or is allowed cross-department
        // (Add validation as per business rules)
        // Phase 9: Algorithm Finalization
        // Phase 10: Edge Orchestration
        // Phase 11: Invigilator Constraints (New)

        // STEP 6: Create registration
        Registration registration = new Registration();
        registration.setStudent(student);
        registration.setCourse(course);
        registration.setSession(session);
        registration.setSemester(semester);

        // STEP 7: Update course enrollment count
        course.setEnrollmentCount(course.getEnrollmentCount() + 1);
        courseRepository.save(course);

        return registrationRepository.save(registration);
    }

    @Override
    public List<Registration> getRegistrationsByScope(String actorUsername) {
        ScopeContext scope = pelService.extractScope(actorUsername);

        switch (scope.getRoleCode()) {
            case "AD":
                return registrationRepository.findAll();
            case "CR":
                return registrationRepository.findByStudentDepartmentCentreId(scope.getCollegeId());
            case "DR":
            case "ST":
                return registrationRepository.findByStudentDepartmentId(scope.getDepartmentId());
            default:
                return Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public void deleteRegistration(Long registrationId, String actorUsername) {
        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RuntimeException("Registration not found"));

        // Verify scope
        if (!pelService.hasScope(actorUsername, "Registration", registration.getStudent().getDepartment().getId(), "DELETE")) {
            throw new SecurityException("Access denied");
        }

        // Update course enrollment count
        Course course = registration.getCourse();
        course.setEnrollmentCount(Math.max(0, course.getEnrollmentCount() - 1));
        courseRepository.save(course);

        registrationRepository.delete(registration);
    }
}
```

### 3.3 Student Semester Registration Service

#### ✅ StudentSemesterRegistration Repository

```java
public interface StudentSemesterRegistrationRepository extends JpaRepository<StudentSemesterRegistration, Long> {
    Optional<StudentSemesterRegistration> findByStudentAndSessionAndSemester(Student student, String session, Integer semester);
    boolean existsByStudentAndSessionAndSemester(Student student, String session, Integer semester);
    List<StudentSemesterRegistration> findByStudent(Student student);
    List<StudentSemesterRegistration> findBySessionAndSemester(String session, Integer semester);
}
```

#### ✅ Enrollment Service

```java
@Service
@Transactional
public class StudentSemesterRegistrationServiceImpl implements StudentSemesterRegistrationService {

    @Autowired
    private StudentSemesterRegistrationRepository semesterRegistrationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PolicyEnforcementService pelService;

    /**
     * Enroll student for a semester - MUST happen before course registration
     */
    @Override
    public StudentSemesterRegistration enrollStudent(Integer studentId, String session, Integer semester, Integer level, String actorUsername) {

        // STEP 1: Verify student exists
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        // STEP 2: Verify scope
        if (!pelService.hasScope(actorUsername, "StudentSemesterRegistration", student.getDepartment().getId(), "CREATE")) {
            throw new SecurityException("Access denied");
        }

        // STEP 3: Check if already enrolled
        if (semesterRegistrationRepository.existsByStudentAndSessionAndSemester(student, session, semester)) {
            throw new RuntimeException("Student already enrolled for this session/semester");
        }

        // STEP 4: Create enrollment
        StudentSemesterRegistration enrollment = new StudentSemesterRegistration();
        enrollment.setStudent(student);
        enrollment.setSession(session);
        enrollment.setSemester(semester);
        enrollment.setLevel(level != null ? level : student.getLevel());

        return semesterRegistrationRepository.save(enrollment);
    }

    @Override
    public List<StudentSemesterRegistration> getEnrollmentsByScope(String actorUsername, String session, Integer semester) {
        // Apply scope filtering similar to registration service
        return semesterRegistrationRepository.findBySessionAndSemester(session, semester);
    }

    @Override
    public boolean isStudentEnrolled(Integer studentId, String session, Integer semester) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        return semesterRegistrationRepository.existsByStudentAndSessionAndSemester(student, session, semester);
    }
}
```

### 3.4 Student Service with Scope Enforcement

#### ✅ Student Service

```java
@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private PolicyEnforcementService pelService;

    @Override
    public Student createStudent(Student student, String actorUsername) {
        // Verify department exists
        if (student.getDepartment() == null || student.getDepartment().getId() == null) {
            throw new RuntimeException("Department is required");
        }

        Department department = departmentRepository.findById(student.getDepartment().getId())
            .orElseThrow(() -> new RuntimeException("Department not found"));

        // Verify scope
        if (!pelService.hasScope(actorUsername, "Student", department.getId(), "CREATE")) {
            throw new SecurityException("Access denied");
        }

        // Verify program exists and belongs to same department
        if (student.getProgram() != null && student.getProgram().getId() != null) {
            Program program = programRepository.findById(student.getProgram().getId())
                .orElseThrow(() -> new RuntimeException("Program not found"));

            if (!program.getDepartment().getId().equals(department.getId())) {
                throw new RuntimeException("Program does not belong to student's department");
            }

            student.setProgram(program);
        }

        student.setDepartment(department);

        return studentRepository.save(student);
    }

    @Override
    public List<Student> getStudentsByScope(String actorUsername) {
        List<Integer> accessibleDeptIds = pelService.getAccessibleDepartmentIds(actorUsername);
        return studentRepository.findByDepartmentIdIn(accessibleDeptIds);
    }

    @Override
    public Student updateStudent(Integer studentId, Student updatedStudent, String actorUsername) {
        Student existing = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        // Verify scope
        if (!pelService.hasScope(actorUsername, "Student", existing.getDepartment().getId(), "UPDATE")) {
            throw new SecurityException("Access denied");
        }

        // Update fields
        existing.setMatricNo(updatedStudent.getMatricNo());
        existing.setSurname(updatedStudent.getSurname());
        existing.setFirstname(updatedStudent.getFirstname());
        existing.setMiddlename(updatedStudent.getMiddlename());
        existing.setGender(updatedStudent.getGender());
        existing.setLevel(updatedStudent.getLevel());
        existing.setStartSession(updatedStudent.getStartSession());

        return studentRepository.save(existing);
    }

    @Override
    public void deleteStudent(Integer studentId, String actorUsername) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        // Verify scope
        if (!pelService.hasScope(actorUsername, "Student", student.getDepartment().getId(), "DELETE")) {
            throw new SecurityException("Access denied");
        }

        studentRepository.delete(student);
    }
}
```

### 3.5 Course Service with Scope Enforcement

#### ✅ Course Service

```java
@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PolicyEnforcementService pelService;

    @Override
    public Course createCourse(Course course, String actorUsername) {
        // Verify department exists
        if (course.getDepartment() == null || course.getDepartment().getId() == null) {
            throw new RuntimeException("Department is required");
        }

        Department department = departmentRepository.findById(course.getDepartment().getId())
            .orElseThrow(() -> new RuntimeException("Department not found"));

        // Verify scope
        if (!pelService.hasScope(actorUsername, "Course", department.getId(), "CREATE")) {
            throw new SecurityException("Access denied");
        }

        course.setDepartment(department);

        return courseRepository.save(course);
    }

    @Override
    public List<Course> getCoursesByScope(String actorUsername) {
        List<Integer> accessibleDeptIds = pelService.getAccessibleDepartmentIds(actorUsername);
        return courseRepository.findByDepartmentIdIn(accessibleDeptIds);
    }

    @Override
    public Course updateCourse(Integer courseId, Course updatedCourse, String actorUsername) {
        Course existing = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        // Verify scope
        if (!pelService.hasScope(actorUsername, "Course", existing.getDepartment().getId(), "UPDATE")) {
            throw new SecurityException("Access denied");
        }

        // Update fields
        existing.setCode(updatedCourse.getCode());
        existing.setTitle(updatedCourse.getTitle());
        existing.setUnit(updatedCourse.getUnit());
        existing.setSemester(updatedCourse.getSemester());
        existing.setExamType(updatedCourse.getExamType());
        existing.setLectureHours(updatedCourse.getLectureHours());
        existing.setTutorialHours(updatedCourse.getTutorialHours());
        existing.setPracticalHours(updatedCourse.getPracticalHours());

        return courseRepository.save(existing);
    }

    @Override
    public void deleteCourse(Integer courseId, String actorUsername) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        // Verify scope
        if (!pelService.hasScope(actorUsername, "Course", course.getDepartment().getId(), "DELETE")) {
            throw new SecurityException("Access denied");
        }

        courseRepository.delete(course);
    }
}
```

---

## 📦 PHASE 4: API LAYER (CONTROLLER STANDARDIZATION)

### 4.1 DTO Layer

#### 📋 Standard API Response DTO

```java
@Data
@Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Map<String, String> errors;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
            .success(false)
            .message(message)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public static <T> ApiResponse<T> error(String message, Map<String, String> errors) {
        return ApiResponse.<T>builder()
            .success(false)
            .message(message)
            .errors(errors)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
```

#### 📋 Registration Request DTO

```java
@Data
public class RegistrationRequest {
    @NotNull(message = "Student ID is required")
    private Integer studentId;

    @NotNull(message = "Course ID is required")
    private Integer courseId;

    @NotBlank(message = "Session is required")
    private String session;

    @NotNull(message = "Semester is required")
    private Integer semester;
}
```

#### 📋 Student Enrollment Request DTO

```java
@Data
public class StudentEnrollmentRequest {
    @NotNull(message = "Student ID is required")
    private Integer studentId;

    @NotBlank(message = "Session is required")
    private String session;

    @NotNull(message = "Semester is required")
    private Integer semester;

    private Integer level;
}
```

#### 📋 Login Request DTO

```java
@Data
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
```

#### 📋 Login Response DTO

```java
@Data
@Builder
public class LoginResponse {
    private Integer id;
    private String username;
    private String token;
    private String role;
    private Integer collegeId;
    private Integer departmentId;
}
```

### 4.2 Standardized Registration Controller

#### 🎛️ Registration Controller

```java
@RestController
@RequestMapping("/api/v1/registrations")
@CrossOrigin(origins = "http://localhost:3000")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<Registration>> registerCourse(
        @Valid @RequestBody RegistrationRequest request,
        @RequestHeader("Authorization") String token
    ) {
        try {
            String username = extractUsernameFromToken(token);

            Registration registration = registrationService.registerStudentForCourse(
                request.getStudentId(),
                request.getCourseId(),
                request.getSession(),
                request.getSemester(),
                username
            );

            return ResponseEntity.ok(ApiResponse.success("Course registered successfully", registration));

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Registration>>> getRegistrations(
        @RequestHeader("Authorization") String token
    ) {
        String username = extractUsernameFromToken(token);
        List<Registration> registrations = registrationService.getRegistrationsByScope(username);
        return ResponseEntity.ok(ApiResponse.success(registrations));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRegistration(
        @PathVariable Long id,
        @RequestHeader("Authorization") String token
    ) {
        try {
            String username = extractUsernameFromToken(token);
            registrationService.deleteRegistration(id, username);
            return ResponseEntity.ok(ApiResponse.success("Registration deleted successfully", null));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    private String extractUsernameFromToken(String token) {
        String jwtToken = token.replace("Bearer ", "");
        return jwtUtil.extractUsername(jwtToken);
    }
}
```

### 4.3 Standardized User Controller

#### 🎛️ User Controller

```java
@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Users user = userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword());

            String token = jwtUtil.generateToken(user);

            LoginResponse response = LoginResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .token(token)
                .role(user.getRole().getCode())
                .collegeId(user.getCollege() != null ? user.getCollege().getId() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .build();

            return ResponseEntity.ok(ApiResponse.success("Login successful", response));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Users>> register(@Valid @RequestBody Users user) {
        try {
            Users registered = userService.registerUser(user);
            return ResponseEntity.ok(ApiResponse.success("User registered successfully", registered));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Users>> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String username = extractUsernameFromToken(token);
            Users user = userService.getUserByUsername(username);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid token"));
        }
    }

    private String extractUsernameFromToken(String token) {
        String jwtToken = token.replace("Bearer ", "");
        return jwtUtil.extractUsername(jwtToken);
    }
}
```

### 4.4 Global Exception Handler

#### 🚨 Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiResponse<Void>> handleSecurityException(SecurityException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error("Access denied: " + e.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity.badRequest()
            .body(ApiResponse.<Void>builder()
                .success(false)
                .message("Validation failed")
                .errors(errors)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Internal server error: " + e.getMessage()));
    }
}
```

---

## 📊 REFACTOR EXECUTION CHECKLIST

### ✅ Step-by-Step Implementation Order

| Step   | Task                                                  | Priority    | Estimated Effort | Dependencies     |
| ------ | ----------------------------------------------------- | ----------- | ---------------- | ---------------- |
| **1**  | **Backup current database**                           | 🔴 CRITICAL | 30 min           | None             |
| **2**  | **Run schema2.sql migration**                         | 🔴 CRITICAL | 1 hour           | Step 1           |
| **3**  | **Create Centre entity**                              | 🔴 CRITICAL | 30 min           | Step 2           |
| **4**  | **Create Department entity**                          | 🔴 CRITICAL | 30 min           | Step 3           |
| **5**  | **Create Program entity**                             | 🔴 CRITICAL | 30 min           | Step 4           |
| **6**  | **Create Role entity**                                | 🔴 CRITICAL | 20 min           | Step 2           |
| **7**  | **Create Users entity**                               | 🔴 CRITICAL | 45 min           | Steps 3, 6       |
| **8**  | **Create Student entity**                             | 🔴 CRITICAL | 45 min           | Steps 4, 5       |
| **9**  | **Create Course entity**                              | 🔴 CRITICAL | 45 min           | Step 4           |
| **10** | **Create Staff entity**                               | 🔴 CRITICAL | 30 min           | Step 4           |
| **11** | **Create Venue entity**                               | 🔴 CRITICAL | 30 min           | Step 3           |
| **12** | **Create StudentSemesterRegistration entity**         | 🔴 CRITICAL | 45 min           | Step 8           |
| **13** | **Create Registration entity**                        | 🔴 CRITICAL | 45 min           | Steps 8, 9, 12   |
| **14** | **Create ConstraintTable entity**                     | 🟡 HIGH     | 30 min           | Step 2           |
| **15** | **Update all Repositories**                           | 🔴 CRITICAL | 2 hours          | Steps 3-13       |
| **16** | **Implement BCrypt configuration**                    | 🔴 CRITICAL | 30 min           | None             |
| **17** | **Add JWT dependencies**                              | 🔴 CRITICAL | 15 min           | None             |
| **18** | **Implement JWT utility**                             | 🔴 CRITICAL | 1 hour           | Step 17          |
| **19** | **Implement ScopeContext DTO**                        | 🔴 CRITICAL | 30 min           | None             |
| **20** | **Build Policy Enforcement Layer**                    | 🔴 CRITICAL | 4 hours          | Steps 15, 19     |
| **21** | **Implement User Service with BCrypt**                | 🔴 CRITICAL | 2 hours          | Steps 16, 20     |
| **22** | **Implement StudentSemesterRegistration Service**     | 🔴 CRITICAL | 2 hours          | Steps 15, 20     |
| **23** | **Implement Registration Service (Enrollment-First)** | 🔴 CRITICAL | 4 hours          | Steps 15, 20, 22 |
| **24** | **Implement Student Service**                         | 🟡 HIGH     | 2 hours          | Steps 15, 20     |
| **25** | **Implement Course Service**                          | 🟡 HIGH     | 2 hours          | Steps 15, 20     |
| **26** | **Implement Staff Service**                           | 🟡 HIGH     | 2 hours          | Steps 15, 20     |
| **27** | **Create DTO classes**                                | 🟡 HIGH     | 2 hours          | None             |
| **28** | **Implement ApiResponse wrapper**                     | 🟡 HIGH     | 30 min           | None             |
| **29** | **Implement Global Exception Handler**                | 🟢 MEDIUM   | 1 hour           | Step 28          |
| **30** | **Standardize User Controller**                       | 🔴 CRITICAL | 2 hours          | Steps 21, 27, 28 |
| **31** | **Standardize Registration Controller**               | 🔴 CRITICAL | 2 hours          | Steps 23, 27, 28 |
| **32** | **Standardize Student Controller**                    | 🟡 HIGH     | 1.5 hours        | Steps 24, 27, 28 |
| **33** | **Standardize Course Controller**                     | 🟡 HIGH     | 1.5 hours        | Steps 25, 27, 28 |
| **34** | **Test authentication flow**                          | 🔴 CRITICAL | 2 hours          | Steps 18, 21, 30 |
| **35** | **Test enrollment-first logic**                       | 🔴 CRITICAL | 2 hours          | Steps 22, 23, 31 |
| **36** | **Test scope enforcement**                            | 🔴 CRITICAL | 3 hours          | All services     |
| **37** | **Unit tests for services**                           | 🟡 HIGH     | 8 hours          | All services     |
| **38** | **Integration tests**                                 | 🟢 MEDIUM   | 4 hours          | All controllers  |
| **39** | **Update Frontend API calls**                         | 🟡 HIGH     | 4 hours          | All controllers  |
| **40** | **End-to-end testing**                                | 🔴 CRITICAL | 4 hours          | All              |

**Total Estimated Effort:** ~65 hours

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Complete When:

- ✅ All entities match schema2.sql exactly
- ✅ All FK relationships use JPA annotations
- ✅ No compilation errors
- ✅ Application starts successfully
- ✅ Database migrations applied without errors

### Phase 2 Complete When:

- ✅ Passwords are BCrypt hashed
- ✅ JWT tokens generated and validated
- ✅ PEL service enforces role-based scope
- ✅ All endpoints require authentication
- ✅ Login returns JWT token

### Phase 3 Complete When:

- ✅ Registration service enforces Enrollment-First
- ✅ All services validate FK existence before save
- ✅ Transactions rollback on error
- ✅ No orphan records possible
- ✅ Scope enforcement works for all CRUD operations

### Phase 4 Complete When:

- ✅ All endpoints return standardized ApiResponse
- ✅ DTOs separate request/response from entities
- ✅ Global exception handler catches all errors
- ✅ API versioning implemented (/api/v1/\*)
- ✅ Validation errors return proper format

---

## ⚠️ CRITICAL WARNINGS

1. **DO NOT** execute this refactor on production database
2. **DO NOT** skip entity alignment - backend will crash
3. **DO NOT** skip DIV implementation - data integrity at risk
4. **DO NOT** skip PEL implementation - security breach risk
5. **MUST** test enrollment-first logic thoroughly
6. **MUST** backup database before schema migration
7. **DO NOT** merge old entity code with new - complete rewrite required
8. **MUST** update all repository queries after entity changes
9. **MUST** coordinate with frontend team for API changes
10. **DO NOT** skip testing - broken authentication will lock out all users

---

## 🚀 QUICK START GUIDE

### Step 1: Database Migration

```bash
# Backup existing database
mysqldump -u root -p examtt > backup_examtt_$(date +%Y%m%d).sql

# Create new database
mysql -u root -p < schema2.sql
```

### Step 2: Update Dependencies (pom.xml or build.gradle)

```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### Step 3: Configuration Files

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/examtt2
spring.datasource.username=root
spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

jwt.secret=BellsUniversityTimetableGeneratorSecretKey2024!@#$%^&*()
jwt.expiration=86400000
```

### Step 4: Entity Creation Priority

1. **Foundation Entities**: Centre, Role
2. **Reference Entities**: Department, Program
3. **Operational Entities**: Users, Student, Course, Staff, Venue
4. **Transactional Entities**: StudentSemesterRegistration, Registration
5. **Configuration Entities**: ConstraintTable, OptimizationSettings, OutputTab

### Step 5: Testing Strategy

1. **Unit Tests**: Test each service method in isolation
2. **Integration Tests**: Test controller endpoints with security
3. **Enrollment-First Tests**: Verify registration fails without enrollment
4. **Scope Tests**: Verify CRUD operations respect role boundaries
5. **End-to-End Tests**: Complete user journeys (login → enroll → register)

---

## 📝 MIGRATION SCRIPT TEMPLATE

### Database Migration Checklist

```sql
-- 1. Backup
-- Already done via mysqldump

-- 2. Create new database
CREATE DATABASE IF NOT EXISTS examtt2;

-- 3. Run schema2.sql
SOURCE schema2.sql;

-- 4. Migrate existing data (if applicable)
INSERT INTO examtt2.centre (code, name, type, state)
SELECT code, name, type, state FROM examtt.centre;

INSERT INTO examtt2.department (centre_id, code, name)
SELECT centre_id, code, name FROM examtt.department;

-- Continue for other tables...

-- 5. Verify data integrity
SELECT COUNT(*) FROM examtt2.centre;
SELECT COUNT(*) FROM examtt2.department;
SELECT COUNT(*) FROM examtt2.student;
```

---

## 🔍 VERIFICATION TESTS

### Test 1: Entity Alignment

```java
@Test
public void testEntityAlignmentWithSchema() {
    // Verify all entities load without errors
    assertNotNull(centreRepository.findAll());
    assertNotNull(departmentRepository.findAll());
    assertNotNull(studentRepository.findAll());
}
```

### Test 2: Enrollment-First Enforcement

```java
@Test
public void testRegistrationFailsWithoutEnrollment() {
    // Attempt to register course without enrollment
    assertThrows(RuntimeException.class, () -> {
        registrationService.registerStudentForCourse(1, 1, "2024/2025", 1, "admin");
    });
}
```

### Test 3: Scope Enforcement

```java
@Test
public void testDepartmentRepCannotAccessOtherDepartments() {
    // Login as department rep
    // Attempt to access student from different department
    assertThrows(SecurityException.class, () -> {
        studentService.getStudentsByScope("dept_rep_username");
    });
}
```

### Test 4: JWT Authentication

```java
@Test
public void testJwtTokenGeneration() {
    Users user = new Users();
    user.setUsername("admin");
    user.setRole(adminRole);

    String token = jwtUtil.generateToken(user);
    assertNotNull(token);
    assertTrue(jwtUtil.validateToken(token, user));
}
```

---

## 🎨 FRONTEND INTEGRATION NOTES

### Updated API Endpoints

| Old Endpoint        | New Endpoint            | Auth Required | Changes                   |
| ------------------- | ----------------------- | ------------- | ------------------------- |
| `/users/login`      | `/api/v1/users/login`   | No            | Returns JWT token         |
| `/student/get`      | `/api/v1/students`      | Yes           | Requires Bearer token     |
| `/course/get`       | `/api/v1/courses`       | Yes           | Requires Bearer token     |
| `/registration/add` | `/api/v1/registrations` | Yes           | Requires enrollment first |

### Frontend Changes Required

1. **Update Base URL**: Change all API calls to `/api/v1/*`
2. **Add JWT Token**: Include `Authorization: Bearer <token>` header
3. **Handle ApiResponse**: Update response parsing to use standardized format
4. **Error Handling**: Update to handle new error response structure
5. **Enrollment Flow**: Add student enrollment step before course registration

### Example Frontend API Call

```typescript
// Old way
const response = await fetch(
  "http://localhost:8080/student/get?username=admin",
);
const students = await response.json();

// New way
const token = localStorage.getItem("token");
const response = await fetch("http://localhost:8080/api/v1/students", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const apiResponse = await response.json();
if (apiResponse.success) {
  const students = apiResponse.data;
}
```

---

## 🛠️ TROUBLESHOOTING GUIDE

### Issue 1: Application Won't Start

**Symptom**: Spring Boot fails to start with entity mapping errors

**Solution**:

1. Verify all entities match schema2.sql
2. Check for circular dependencies in relationships
3. Ensure `spring.jpa.hibernate.ddl-auto=validate`
4. Check database connection settings

### Issue 2: Authentication Fails

**Symptom**: Login returns 401 Unauthorized

**Solution**:

1. Verify BCrypt password hashing
2. Check JWT secret in application.properties
3. Verify User entity has correct role relationship
4. Check if password was hashed when user was created

### Issue 3: Scope Enforcement Not Working

**Symptom**: Users can access data outside their scope

**Solution**:

1. Verify PEL service is properly injected
2. Check if username is correctly extracted from JWT
3. Verify department/college relationships in database
4. Check if hasScope method logic is correct

### Issue 4: Enrollment-First Fails

**Symptom**: Course registration succeeds without enrollment

**Solution**:

1. Verify StudentSemesterRegistration table exists
2. Check if FK constraint is properly defined
3. Verify service logic checks enrollment before registration
4. Check transaction boundaries

### Issue 5: Foreign Key Violations

**Symptom**: Cannot delete entities due to FK constraints

**Solution**:

1. Check cascade settings in entity relationships
2. Verify ON DELETE CASCADE in schema
3. Consider soft delete instead of hard delete
4. Check if child records exist before deletion

---

## 📚 ADDITIONAL RESOURCES

### Documentation to Create (After Implementation)

1. API Documentation (Swagger/OpenAPI)
2. Database Schema Diagram
3. Authentication Flow Diagram
4. Scope Resolution Logic Diagram
5. Deployment Guide
6. Developer Onboarding Guide

### Testing Tools

- **Postman**: For API testing
- **JUnit**: For unit tests
- **Spring Test**: For integration tests
- **MySQL Workbench**: For database verification

### Monitoring & Logging

- Add logging to all service methods
- Monitor JWT token expiration
- Track failed authentication attempts
- Log scope violations for security audit

---

## ✅ FINAL CHECKLIST

### Before Starting Refactor

- [ ] Read entire refactor plan
- [ ] Understand schema2.sql structure
- [ ] Review Current SYSTEM.md rules
- [ ] Backup production database
- [ ] Set up development environment
- [ ] Create new Git branch

### During Refactor

- [ ] Follow execution order strictly
- [ ] Test each phase before moving to next
- [ ] Commit frequently with clear messages
- [ ] Update documentation as you go
- [ ] Ask questions if anything is unclear

### After Refactor

- [ ] All entities aligned with schema2.sql
- [ ] All tests passing
- [ ] Authentication working
- [ ] Scope enforcement verified
- [ ] Enrollment-first logic working
- [ ] Frontend integration complete
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] User acceptance testing complete

---

## 🎯 EXPECTED OUTCOMES

### Technical Improvements

1. **100% Schema Alignment**: Backend models perfectly match database
2. **Secure Authentication**: BCrypt + JWT implementation
3. **Enforced Authorization**: PEL ensures role-based access
4. **Data Integrity**: DIV prevents orphan records
5. **Business Logic Enforcement**: Enrollment-first principle
6. **Standardized API**: Consistent response format
7. **Proper Error Handling**: Meaningful error messages

### Operational Benefits

1. **Reduced Bugs**: Strong typing and validation
2. **Better Security**: No plain text passwords, scope enforcement
3. **Easier Maintenance**: Clear separation of concerns
4. **Better Testing**: Each layer independently testable
5. **Scalability**: Modular architecture supports growth
6. **Audit Trail**: All operations logged with actor

### Development Experience

1. **Clearer Code Structure**: Easy to navigate
2. **Better IDE Support**: Strong typing helps autocomplete
3. **Easier Onboarding**: New developers understand flow
4. **Faster Debugging**: Clear error messages and logs

---

## 📞 SUPPORT & QUESTIONS

If you encounter any issues during implementation:

1. **Review the relevant section** in this document
2. **Check the troubleshooting guide** for common issues
3. **Verify your implementation** against the code examples
4. **Test in isolation** to identify the problem area
5. **Ask for help** with specific error messages

---

## 🎉 CONCLUSION

This refactor plan provides a **complete, step-by-step blueprint** for transforming the backend from its current misaligned state to a **production-ready, secure, and maintainable system** that perfectly aligns with schema2.sql and enforces all business rules.

**Key Takeaways:**

- ✅ Schema alignment is **non-negotiable**
- ✅ Security (BCrypt + JWT + PEL) is **mandatory**
- ✅ Enrollment-First logic is **enforced at service layer**
- ✅ Scope enforcement protects **data access boundaries**
- ✅ Standardized API improves **frontend integration**

**Estimated Timeline:** 8-10 working days for complete implementation and testing.

---

**Status**: Ready for Implementation
**Last Updated**: 2026-01-31
**Version**: 1.0

---

_This document is a living guide. Update it as implementation progresses and new insights emerge._
