package com.nuts.fs.dao;

import com.nuts.fs.model.EpidemicReportCompanyTable;
import com.nuts.fs.model.NhsqInfomationTable;
import com.nuts.fs.model.Page;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.lang.reflect.Field;
import java.util.List;

@Repository
public class AppDao {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public AppDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * 人员信息表查询 TODO 用户保存配置列表项 三种人
     *
     * @param nhsqInfomationTable 人员信息表
     * @return 人员信息集合
     */
    public List<NhsqInfomationTable> getNhsqInfomationTable(NhsqInfomationTable nhsqInfomationTable, Page page, String district) {
        StringBuilder sb = new StringBuilder();
        String limit = "";
        if (0 != page.getPageNo() || 0 != page.getPageSize()) {
            if (0 == page.getPageNo()) {
                limit = " LIMIT 0," + page.getPageSize();
            } else {
                limit = " LIMIT " + ((page.getPageNo() - 1) * page.getPageSize()) + "," + page.getPageSize();
            }
        }

        // TODO 适配湖北、武汉、温州

        dealWithStringBuilder(nhsqInfomationTable, sb, district, 1);
        if ("是".equals(nhsqInfomationTable.getISWENZHOU())) {
            page.setTotal(jdbcTemplate.queryForObject("(SELECT count(*) FROM nhsq_information " + sb + " AND (IDCODE LIKE '3303%' OR TRAVELSTART LIKE '%温州%'))", Integer.class));
            if (!StringUtils.isEmpty(page.getSortName()) || !StringUtils.isEmpty(page.getSortOrder())) {
                if ("answertime".equals(page.getSortName())) {
                    page.setSortName("answer_time");
                }
                return jdbcTemplate.query("(SELECT *,'是' as iswenzhou FROM nhsq_information " + sb + " AND (IDCODE LIKE '3303%' OR TRAVELSTART LIKE '%温州%') ORDER BY " + page.getSortName() + " IS NULL," + page.getSortName() + " " + page.getSortOrder() + limit + ")", new Object[]{}, new BeanPropertyRowMapper<>(NhsqInfomationTable.class));
            } else {
                return jdbcTemplate.query("(SELECT *,'是' as iswenzhou FROM nhsq_information " + sb + " AND (IDCODE LIKE '3303%' OR TRAVELSTART LIKE '%温州%') ORDER BY UPDATETIME IS NULL,UPDATETIME DESC " + limit + ")", new Object[]{}, new BeanPropertyRowMapper<>(NhsqInfomationTable.class));
            }
        } else {
            page.setTotal(jdbcTemplate.queryForObject("(SELECT count(*) FROM nhsq_information " + sb + ")", Integer.class));
            if (!StringUtils.isEmpty(page.getSortName()) || !StringUtils.isEmpty(page.getSortOrder())) {
                if ("answertime".equals(page.getSortName())) {
                    page.setSortName("answer_time");
                }
                return jdbcTemplate.query("(SELECT *,'否' as iswenzhou FROM nhsq_information " + sb + " ORDER BY " + page.getSortName() + " IS NULL," + page.getSortName() + " " + page.getSortOrder() + limit + ")", new Object[]{}, new BeanPropertyRowMapper<>(NhsqInfomationTable.class));
            } else {
                return jdbcTemplate.query("(SELECT *,'否' as iswenzhou FROM nhsq_information " + sb + " ORDER BY UPDATETIME IS NULL,UPDATETIME DESC " + limit + ")", new Object[]{}, new BeanPropertyRowMapper<>(NhsqInfomationTable.class));
            }
        }
    }

    /**
     * 企业违规复工表查询
     *
     * @param epidemicReportCompanyTable 企业违规复工表
     * @return 企业违规复工集合
     */
    public List<EpidemicReportCompanyTable> getEpidemicReportCompanyTable(EpidemicReportCompanyTable epidemicReportCompanyTable, Page page, String district) {
        StringBuilder sb = new StringBuilder();
        String limit = "";
        if (0 != page.getPageNo() || 0 != page.getPageSize()) {
            if (0 == page.getPageNo()) {
                limit = " LIMIT 0," + page.getPageSize();
            } else {
                limit = " LIMIT " + ((page.getPageNo() - 1) * page.getPageSize()) + "," + page.getPageSize();
            }
        }

        // 判断是否有筛选条件
        dealWithStringBuilder(epidemicReportCompanyTable, sb, district, 2);
        page.setTotal(jdbcTemplate.queryForObject("(SELECT count(*) FROM epidemic_report_company " + sb + ")", Integer.class));
        if (!StringUtils.isEmpty(page.getSortName()) || !StringUtils.isEmpty(page.getSortOrder())) {
            return jdbcTemplate.query("(SELECT * FROM epidemic_report_company " + sb + " ORDER BY " + page.getSortName() + " IS NULL," + page.getSortName() + " " + page.getSortOrder() + limit + ")", new Object[]{}, new BeanPropertyRowMapper<>(EpidemicReportCompanyTable.class));
        } else {
            return jdbcTemplate.query("(SELECT * FROM epidemic_report_company " + sb + " ORDER BY update_time IS NULL,update_time DESC " + limit + ")", new Object[]{}, new BeanPropertyRowMapper<>(EpidemicReportCompanyTable.class));
        }
    }

    /**
     * 判断对象中属性值是否全为空
     *
     * @param object 对象
     */
    private static void dealWithStringBuilder(Object object, StringBuilder sb, String district, int index) {
        sb.append(" WHERE 1 = 1 ");
        if ("440606".equals(district)) {
            if (index == 1) {
                sb.append(" AND DISTRICT = '顺德区' ");
            } else if (index == 2) {
                sb.append(" AND EVENT_DISTRICT = '顺德区' ");
            }
        } else if ("440604".equals(district)) {
            if (index == 1) {
                sb.append(" AND DISTRICT = '禅城区' ");
            } else if (index == 2) {
                sb.append(" AND EVENT_DISTRICT = '禅城区' ");
            }
        } else if ("440608".equals(district)) {
            if (index == 1) {
                sb.append(" AND DISTRICT = '高明区' ");
            } else if (index == 2) {
                sb.append(" AND EVENT_DISTRICT = '高明区' ");
            }
        } else if ("440605".equals(district)) {
            if (index == 1) {
                sb.append(" AND DISTRICT = '南海区' ");
            } else if (index == 2) {
                sb.append(" AND EVENT_DISTRICT = '南海区' ");
            }
        } else if ("440607".equals(district)) {
            if (index == 1) {
                sb.append(" AND DISTRICT = '三水区' ");
            } else if (index == 2) {
                sb.append(" AND EVENT_DISTRICT = '三水区' ");
            }
        }

        if (null == object) {
            return;
        }

        try {
            for (Field f : object.getClass().getDeclaredFields()) {
                f.setAccessible(true);

                // 组装where条件
                if (f.get(object) != null) {
                    if (!"iswenzhou".equals(f.getName()) && !"ISWENZHOU".equals(f.getName())) {
                        // 年龄、开始时间、结束时间、离开湖北时间、体温
                        if ("age".equals(f.getName()) || "AGE".equals(f.getName())) {
                            String type[] = f.get(object).toString().split(",");
                            if (type.length == 1 && StringUtils.isNotBlank(type[0])) {
                                sb.append(" AND FLOOR(DATEDIFF(DATE_FORMAT(now(),'%Y%m%d'),substring(IDCODE,7,8))/365.25) >= '").append(type[0]).append("'");
                                sb.append(" AND FLOOR(DATEDIFF(DATE_FORMAT(now(),'%Y%m%d'),substring(IDCODE,7,8))/365.25) <= '150'");
                            }
                            if (type.length == 2) {
                                if (StringUtils.isNotBlank(type[0])) {
                                    sb.append(" AND FLOOR(DATEDIFF(DATE_FORMAT(now(),'%Y%m%d'),substring(IDCODE,7,8))/365.25) >= '").append(type[0]).append("'");
                                } else {
                                    sb.append(" AND FLOOR(DATEDIFF(DATE_FORMAT(now(),'%Y%m%d'),substring(IDCODE,7,8))/365.25) >= '0'");
                                }
                                if (StringUtils.isNotBlank(type[1])) {
                                    sb.append(" AND FLOOR(DATEDIFF(DATE_FORMAT(now(),'%Y%m%d'),substring(IDCODE,7,8))/365.25) <= '").append(type[1]).append("'");
                                } else {
                                    sb.append(" AND FLOOR(DATEDIFF(DATE_FORMAT(now(),'%Y%m%d'),substring(IDCODE,7,8))/365.25) <= '150'");
                                }
                            }
                        } else if ("sex".equals(f.getName()) || "SEX".equals(f.getName())) {
                            sb.append(" AND CASE(SUBSTR(IDCODE,17,1)%2) WHEN 1 THEN '男' WHEN 0 THEN '女' END = '").append(f.get(object)).append("'");
                        } else if ("STARTTIME".equals(f.getName())) {
                            String type[] = f.get(object).toString().split(",");
                            sb.append(" AND ").append(f.getName()).append(" >= '").append(type[0]).append("'");
                            sb.append(" AND ").append(f.getName()).append(" <= '").append(type[1]).append("'");
                        } else if ("ENDTIME".equals(f.getName())) {
                            String type[] = f.get(object).toString().split(",");
                            sb.append(" AND ").append(f.getName()).append(" >= '").append(type[0]).append("'");
                            sb.append(" AND ").append(f.getName()).append(" <= '").append(type[1]).append("'");
                        } else if ("LEAVETIME".equals(f.getName())) {
                            String type[] = f.get(object).toString().split(",");
                            sb.append(" AND ").append(f.getName()).append(" >= '").append(type[0]).append("'");
                            sb.append(" AND ").append(f.getName()).append(" <= '").append(type[1]).append("'");
                        } else if ("ARRIVETIME".equals(f.getName())) {
                            String type[] = f.get(object).toString().split(",");
                            sb.append(" AND ").append(f.getName()).append(" >= '").append(type[0]).append("'");
                            sb.append(" AND ").append(f.getName()).append(" <= '").append(type[1]).append("'");
                        } else if ("NOWTEMPERATURE".equals(f.getName())) {
                            String type[] = f.get(object).toString().split(",");
                            if (type.length == 1 && StringUtils.isNotBlank(type[0])) {
                                sb.append(" AND ").append(f.getName()).append(" >= '").append(type[0]).append("'");
                                sb.append(" AND ").append(f.getName()).append(" <= '50'");
                            }
                            if (type.length == 2) {
                                if (StringUtils.isNotBlank(type[0])) {
                                    sb.append(" AND ").append(f.getName()).append(" >= '").append(type[0]).append("'");
                                } else {
                                    sb.append(" AND ").append(f.getName()).append(" >= '30'");
                                }
                                if (StringUtils.isNotBlank(type[1])) {
                                    sb.append(" AND ").append(f.getName()).append(" <= '").append(type[1]).append("'");
                                } else {
                                    sb.append(" AND ").append(f.getName()).append(" <= '50'");
                                }
                            }
                        } else if ("istouchpatient".equals(f.getName()) || "ISTOUCHPATIENT".equals(f.getName())) {
                            if ("是".equals(f.get(object))) {
                                sb.append(" AND ").append(f.getName()).append(" LIKE '%1%'");
                            } else if ("否".equals(f.get(object))) {
                                sb.append(" AND ").append(f.getName()).append(" LIKE '%0%'");
                            }
                        } else if ("fever_touch".equals(f.getName()) || "FEVER_TOUCH".equals(f.getName())) {
                            if ("是".equals(f.get(object))) {
                                sb.append(" AND ").append(f.getName()).append(" LIKE '%1%'");
                            } else if ("否".equals(f.get(object))) {
                                sb.append(" AND ").append(f.getName()).append(" LIKE '%0%'");
                            }
                        } else if ("cough".equals(f.getName()) || "COUGH".equals(f.getName())) {
                            if ("是".equals(f.get(object))) {
                                sb.append(" AND ").append(f.getName()).append(" LIKE '%1%'");
                            } else if ("否".equals(f.get(object))) {
                                sb.append(" AND ").append(f.getName()).append(" LIKE '%0%'");
                            }
                        } else if ("polypnea".equals(f.getName()) || "POLYPNEA".equals(f.getName())) {
                            if ("是".equals(f.get(object))) {
                                sb.append(" AND ").append(f.getName()).append(" LIKE '%1%'");
                            } else if ("否".equals(f.get(object))) {
                                sb.append(" AND ").append(f.getName()).append(" LIKE '%0%'");
                            }
                        } else {
                            sb.append(" AND ").append(f.getName()).append(" LIKE '%").append(f.get(object)).append("%'");
                        }
                        // TODO 单个筛选多选
//                        String name[] = f.get(object).toString().split("\0019");
//                        sb.append(" AND ").append(f.getName()).append(" = '").append(name[0]).append("'");
//                        for (int i = 1; i < name.length; i++) {
//                            sb.append(" OR ").append(f.getName()).append(" = '").append(name[i]).append("'");
//                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}