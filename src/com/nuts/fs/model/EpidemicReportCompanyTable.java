package com.nuts.fs.model;

import org.apache.commons.lang3.StringUtils;

public class EpidemicReportCompanyTable {
    private String id;
    private String autonym;
    private String reporter_name;
    private String reporter_phone;
    private String reporter_id_num;
    private String event_district;
    private String event_town;
    private String event_address;
    private String violative_company;
    private String event_description;
    private String create_time;
    private String update_time;
    private String sys_id;
    private String read_status;
    private String opinion;
    private String answer_time;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAutonym() {
        return autonym;
    }

    public void setAutonym(String autonym) {
        this.autonym = autonym;
    }

    public String getReporter_name() {
        return reporter_name;
    }

    public void setReporter_name(String reporter_name) {
        this.reporter_name = reporter_name;
    }

    public String getReporter_phone() {
        return reporter_phone;
    }

    public void setReporter_phone(String reporter_phone) {
        this.reporter_phone = reporter_phone;
    }

    public String getReporter_id_num() {
        return reporter_id_num;
    }

    public void setReporter_id_num(String reporter_id_num) {
        this.reporter_id_num = reporter_id_num;
    }

    public String getEvent_district() {
        return event_district;
    }

    public void setEvent_district(String event_district) {
        this.event_district = event_district;
    }

    public String getEvent_town() {
        return event_town;
    }

    public void setEvent_town(String event_town) {
        this.event_town = event_town;
    }

    public String getEvent_address() {
        return event_address;
    }

    public void setEvent_address(String event_address) {
        this.event_address = event_address;
    }

    public String getViolative_company() {
        return violative_company;
    }

    public void setViolative_company(String violative_company) {
        this.violative_company = violative_company;
    }

    public String getEvent_description() {
        return event_description;
    }

    public void setEvent_description(String event_description) {
        this.event_description = event_description;
    }

    public String getCreate_time() {
        if (StringUtils.isNotBlank(create_time)) {
            return create_time.substring(0, create_time.length() - 2);
        } else {
            return create_time;
        }
    }

    public void setCreate_time(String create_time) {
        this.create_time = create_time;
    }

    public String getUpdate_time() {
        if (StringUtils.isNotBlank(update_time)) {
            return update_time.substring(0, update_time.length() - 2);
        } else {
            return update_time;
        }
    }

    public void setUpdate_time(String update_time) {
        this.update_time = update_time;
    }

    public String getSys_id() {
        return sys_id;
    }

    public void setSys_id(String sys_id) {
        this.sys_id = sys_id;
    }

    public String getRead_status() {
        return read_status;
    }

    public void setRead_status(String read_status) {
        this.read_status = read_status;
    }

    public String getOpinion() {
        return opinion;
    }

    public void setOpinion(String opinion) {
        this.opinion = opinion;
    }

    public String getAnswer_time() {
        if (StringUtils.isNotBlank(answer_time)) {
            return answer_time.substring(0, answer_time.length() - 2);
        } else {
            return answer_time;
        }
    }

    public void setAnswer_time(String answer_time) {
        this.answer_time = answer_time;
    }
}
