package generation_logic;

import java.util.*;

/**
 * Utility to handle mapping database constraints to the timetable solver.
 * Specifically handles the inversion of "Inclusive" periods to "Exclusive" ones.
 */
public class ConstraintMapper {

    /**
     * Parses a string in the format "CourseCode(p1,p2,p3)" and handles inversion if needed.
     * Example: "BCS101(1,2,3)" with maxPCount=10 and isInverted=true
     * Returns: Mapping of "BCS101" to [0,4,5,6,7,8,9]
     */
    public static Map<String, int[]> parseAndMapConstraint(String rawConstraint, int maxPCount, boolean isInverted) {
        Map<String, int[]> mapping = new HashMap<>();
        if (rawConstraint == null || rawConstraint.isEmpty()) return mapping;

        // Extracting CourseCode and Periods using regex
        // Pattern matches: CourseCode followed by ( periods )
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(.+?)\\((.+?)\\)");
        java.util.regex.Matcher matcher = pattern.matcher(rawConstraint);

        if (matcher.find()) {
            String courseCode = matcher.group(1).trim();
            String periodsStr = matcher.group(2).trim();
            
            int[] periods;
            if (isInverted) {
                periods = invertPeriods(periodsStr, maxPCount);
            } else {
                periods = parseExclusivePeriods(periodsStr);
            }
            mapping.put(courseCode, periods);
        }
        return mapping;
    }

    /**
     * Processes a semicolon-separated list of constraints like "CSC101(1,2);GST111(5,6)"
     */
    public static Map<String, int[]> parseMultipleConstraints(String rawList, int maxPCount, boolean isInverted) {
        Map<String, int[]> allMappings = new HashMap<>();
        if (rawList == null || rawList.isEmpty()) return allMappings;

        String[] constraints = rawList.split(";");
        for (String c : constraints) {
            allMappings.putAll(parseAndMapConstraint(c.trim(), maxPCount, isInverted));
        }
        return allMappings;
    }

    public static int[] invertPeriods(String inclusiveStr, int maxPCount) {
        if (inclusiveStr == null || inclusiveStr.isEmpty()) return new int[0];
        Set<Integer> inclusiveSet = new HashSet<>();
        for (String p : inclusiveStr.split(",")) {
            try { inclusiveSet.add(Integer.parseInt(p.trim())); } catch (Exception e) {}
        }
        List<Integer> exclusiveList = new ArrayList<>();
        for (int i = 0; i < maxPCount; i++) {
            if (!inclusiveSet.contains(i)) exclusiveList.add(i);
        }
        return listToArray(exclusiveList);
    }

    public static int[] parseExclusivePeriods(String exclusiveStr) {
        if (exclusiveStr == null || exclusiveStr.isEmpty()) return new int[0];
        List<Integer> list = new ArrayList<>();
        for (String p : exclusiveStr.split(",")) {
            try { list.add(Integer.parseInt(p.trim())); } catch (Exception e) {}
        }
        return listToArray(list);
    }

    private static int[] listToArray(List<Integer> list) {
        int[] res = new int[list.size()];
        for (int i = 0; i < list.size(); i++) res[i] = list.get(i);
        return res;
    }

    /**
     * Entry point for applying constraints.
     * Logic: 
     * 1. Global Exclusions: Periods where NO exam can happen (Snapshot).
     * 2. Exam Specific: Periods where a SPECIFIC exam cannot happen (Constraint Table).
     * The generator respects both: an exam is excluded if a period is in EITHER set.
     */
    public static void applyConstraints(entities.ConfigData cData, List<entities.Course> enCourseL, Connection conn, int maxPCount, Map<entities.Course, int[]> periodExclusiveExamsTMap, Long constraintId, Long exclusionId) throws SQLException {
        // 1. Fetch Global Exclusions (Snapshot)
        int[] globalExcl = fetchGlobalExclusions(conn, exclusionId);
        if (globalExcl.length > 0) {
            // Log/Debug global exclusions
            System.out.println("Global Exclusions applied. Count: " + globalExcl.length);
        }

        // 2. Fetch Exam-Specific Constraints (Inclusive & Exclusive)
        String sql = constraintId != null ? "SELECT * FROM constraint_table WHERE id = ?" : "SELECT * FROM constraint_table ORDER BY record_date DESC LIMIT 1";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            if (constraintId != null) pstmt.setLong(1, constraintId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String inc = rs.getString("period_inc_e");
                    String exc = rs.getString("period_exc_e");
                
                // Map Inclusive to Exclusive (Inversion)
                Map<String, int[]> incMap = parseMultipleConstraints(inc, maxPCount, true);
                // Map direct Exclusive
                Map<String, int[]> excMap = parseMultipleConstraints(exc, maxPCount, false);
                
                System.out.println("[DEBUG] Parsing DB Constraints: Found " + incMap.size() + " inclusive and " + excMap.size() + " exclusive rules.");

                // Merge all into the existing TMap used by the solver
                for (entities.Course course : enCourseL) {
                    String code = course.getCourseCode();
                    boolean applied = false;
                    if (incMap.containsKey(code)) {
                        periodExclusiveExamsTMap.put(course, incMap.get(code));
                        applied = true;
                    }
                    if (excMap.containsKey(code)) {
                        // Merge if both exist
                        int[] existing = periodExclusiveExamsTMap.get(course);
                        int[] news = excMap.get(code);
                        if (existing != null) {
                            Set<Integer> merged = new HashSet<>();
                            for (int p : existing) merged.add(p);
                            for (int p : news) merged.add(p);
                            periodExclusiveExamsTMap.put(course, listToArray(new ArrayList<>(merged)));
                        } else {
                            periodExclusiveExamsTMap.put(course, news);
                        }
                        applied = true;
                    }
                    if (applied) {
                        System.out.println("[DEBUG] Applied period constraints for: " + code);
                    }
                }
                
                System.out.println("Integrated specific exam period constraints via DB Mapping.");
            }
        }
    }

    private static int[] fetchGlobalExclusions(Connection conn, Long exclusionId) throws SQLException {
        String sql;
        if (exclusionId != null) {
            sql = "SELECT excluded_periods FROM period_exclusion_snapshots WHERE id = ?";
        } else {
            sql = "SELECT excluded_periods FROM period_exclusion_snapshots WHERE is_active = 1 LIMIT 1";
        }
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            if (exclusionId != null) pstmt.setLong(1, exclusionId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String periods = rs.getString("excluded_periods");
                    return parseExclusivePeriods(periods);
                }
            }
        }
        return new int[0];
    }

    private static void applyExamsSpecificConstraints(List<Object> enCourseL, Map<String, int[]> constraintMap) {
        // Iterate through enrolled courses and set their specific excluded periods
        // This part needs exact Course class method names (e.g., course.setExcludedPeriods(int[]))
    }
}
