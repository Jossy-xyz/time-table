package generation_logic;

import java.sql.*;
import java.util.*;

/**
 * Loads configuration from the examtt3 database.
 */
public class DbConfigLoader {

    /**
     * Entry point to load ALL configuration from database into the cData object.
     * Use null for IDs to pull the latest record.
     */
    public static void loadAll(entities.ConfigData cData, Connection conn, Long gsId, Long otId, Long etId, Long osId) throws SQLException {
        loadFromGeneralSettings(cData, conn, gsId);
        loadFromOutputTab(cData, conn, otId);
        loadFromExamTab(cData, conn, etId);
        loadFromOptimizationSettings(cData, conn, osId);
    }

    private static void loadFromGeneralSettings(entities.ConfigData cData, Connection conn, Long gsId) throws SQLException {
        String sql = gsId != null ? "SELECT * FROM general_settings WHERE id = ?" : "SELECT * FROM general_settings ORDER BY id DESC LIMIT 1";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            if (gsId != null) pstmt.setLong(1, gsId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    // description is often used for the display title or session name
                    String sessionDesc = rs.getString("description");
                    if (sessionDesc != null) cData.setSession(sessionDesc);
                    
                    cData.setTtDaysPerWk(rs.getInt("days_per_week"));
                    cData.setpPerDay(rs.getInt("periods_per_day"));
                    cData.setNoOfTTWeeks(rs.getInt("exam_weeks"));
                    
                    System.out.println("[DEBUG] General Settings: Session=" + sessionDesc + ", DaysPerWk=" + cData.getTtDaysPerWk() + 
                                       ", PPerDay=" + cData.getpPerDay() + ", Weeks=" + cData.getNoOfTTWeeks());
                    // Add more mappings as verified in schema
                }
            }
        }
    }

    private static void loadFromOutputTab(entities.ConfigData cData, Connection conn, Long otId) throws SQLException {
        String sql = otId != null ? "SELECT * FROM output_tab WHERE id = ?" : "SELECT * FROM output_tab ORDER BY id DESC LIMIT 1";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            if (otId != null) pstmt.setLong(1, otId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    cData.setVenueSelPolicy(rs.getInt("venue_alg"));
                    cData.setVenueSelOrder(rs.getInt("venue_alg_order"));
                    cData.setMixedExamsInVenue(rs.getInt("mix_exams") == 1);
                    cData.setLargeExamsFullyInVenue(rs.getInt("le_fullyinV") == 1);
                    cData.setSelectStaffRand(rs.getInt("select_staff_random") == 1);
                    cData.setUpdateStaffDutyCount(rs.getInt("update_staff_duty") == 1);
                    cData.setSkipWeek(rs.getInt("skip_week") == 1);
                    
                    System.out.println("[DEBUG] Output Settings: VenuePolicy=" + cData.getVenueSelPolicy() + ", Mixed=" + cData.isMixedExamsInVenue() + 
                                       ", StaffRand=" + cData.isSelectStaffRand() + ", SkipWeek=" + cData.isSkipWeek());
                }
            }
        }
    }

    private static void loadFromExamTab(entities.ConfigData cData, Connection conn, Long etId) throws SQLException {
        String sql = etId != null ? "SELECT * FROM examtab WHERE id = ?" : "SELECT * FROM examtab ORDER BY id DESC LIMIT 1";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            if (etId != null) pstmt.setLong(1, etId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    cData.setExamSchedullingPolicy(rs.getInt("schedule_policy"));
                    cData.setMaxExamLevel2Schedule(rs.getInt("max_examl"));
                    System.out.println("[DEBUG] Exam Tab: Policy=" + cData.getExamSchedullingPolicy() + ", MaxLevel=" + cData.getMaxExamLevel2Schedule());
                }
            }
        }
    }

    private static void loadFromOptimizationSettings(entities.ConfigData cData, Connection conn, Long osId) throws SQLException {
        String sql = osId != null ? "SELECT * FROM optimization_settings WHERE id = ?" : "SELECT * FROM optimization_settings ORDER BY id DESC LIMIT 1";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            if (osId != null) pstmt.setLong(1, osId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    cData.setGenCount(rs.getInt("opt_cycle_count"));
                    // Note: opt_time might need parsing if it's a string like "30 min"
                    String timeStr = rs.getString("opt_time");
                    System.out.println("Optimization time limit: " + timeStr);
                }
            }
        }
    }

    // public static List<String> loadSlashedCourses(Connection conn) throws SQLException {
    //     List<String> list = new ArrayList<>();
    //     String sql = "SELECT codes FROM slashedc WHERE Sem = ?"; // Needs semester context
    //     try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
    //         // pstmt.setInt(1, currentSemester); 
    //         // ResultSet rs = pstmt.executeQuery();
    //         // while(rs.next()) { list.add(rs.getString("codes")); }
    //     }
    //     return list;
    // }
}
