package com.nuts.fs.model;

import com.nuts.fs.utils.IdcardUtils;
import org.apache.commons.lang3.StringUtils;

public class NhsqInfomationTable {
    private String ID;
    private String originid;
    private String NAME;
    private String IDCODE;
    private String TOWN;
    private String SEX;
    private String AGE;
    private String TELEPHONE;
    private String WORKPLACE;
    private String HOMETOWN;
    private String TRAVELSITUATION;
    private String STARTTIME;
    private String ENDTIME;
    private String vehicle;
    private String vehicleshift;
    private String TRANSPORTION;
    private String TRAVELSTART;
    private String TRAVELDESTINATION;
    private String STAYTIME;
    private String fever_touch;
    private String ISTOUCHPATIENT;
    private String NOWTEMPERATURE;
    private String PHYSICALCONDITION;
    private String CONCATPERSON;
    private String CONCATPERSONTEL;
    private String NOTE;
    private String COMMUNITY;
    private String ADDRESS;
    private String CREATETIME;
    private String ISHUBEI;
    private String ISWUHAN;
    private String SEPSTYLE;
    private String LEAVETIME;
    private String ARRIVETIME;
    private String NEEDHOSPITAL;
    private String DISTRICT;
    private String SYS_ID;
    private String COMEFROM;
    private String STATUS;
    private String UPDATETIME;
    private String cough;
    private String polypnea;
    private String touchdate;
    private String company;
    private String othersymptom;
    private String opinion;
    private String answer_time;
    private String startcity;
    private String startprovince;
    private String enterprisecreditcode;
    private String committee;
    private String reporterphone;
    private String ISWENZHOU;
    private String fever;

    public String getID() {
        return ID;
    }

    public void setID(String ID) {
        this.ID = ID;
    }

    public String getOriginid() {
        return originid;
    }

    public void setOriginid(String originid) {
        this.originid = originid;
    }

    public String getNAME() {
        return NAME;
    }

    public void setNAME(String NAME) {
        this.NAME = NAME;
    }

    public String getIDCODE() {
        if (IDCODE.length() == 18 || IDCODE.length() == 15) {
            return IDCODE;
        } else {
            return "";
        }
    }

    public void setIDCODE(String IDCODE) {
        this.IDCODE = IDCODE;
    }

    public String getTOWN() {
        return TOWN;
    }

    public void setTOWN(String TOWN) {
        this.TOWN = TOWN;
    }

    public String getSEX() {
        String idno = getIDCODE();
        if (StringUtils.isNotBlank(idno) && idno.length() == 18) {
            return IdcardUtils.getGenderByIdCard(getIDCODE());
        } else {
            return SEX;
        }
    }

    public void setSEX(String SEX) {
        this.SEX = SEX;
    }

    public String getAGE() {
        String idno = getIDCODE();
        if (StringUtils.isNotBlank(idno)&& idno.length() == 18) {
            return String.valueOf(IdcardUtils.getAgeByIdCard(getIDCODE()));
        } else {
            return AGE;
        }
    }

    public void setAGE(String AGE) {
        this.AGE = AGE;
    }

    public String getTELEPHONE() {
        return TELEPHONE;
    }

    public void setTELEPHONE(String TELEPHONE) {
        this.TELEPHONE = TELEPHONE;
    }

    public String getWORKPLACE() {
        return WORKPLACE;
    }

    public void setWORKPLACE(String WORKPLACE) {
        this.WORKPLACE = WORKPLACE;
    }

    public String getHOMETOWN() {
        return HOMETOWN;
    }

    public void setHOMETOWN(String HOMETOWN) {
        this.HOMETOWN = HOMETOWN;
    }

    public String getTRAVELSITUATION() {
        return TRAVELSITUATION;
    }

    public void setTRAVELSITUATION(String TRAVELSITUATION) {
        this.TRAVELSITUATION = TRAVELSITUATION;
    }

    public String getSTARTTIME() {
        if (StringUtils.isNotBlank(STARTTIME)) {
            return STARTTIME.substring(0, STARTTIME.length() - 2);
        } else {
            return STARTTIME;
        }
    }

    public void setSTARTTIME(String STARTTIME) {
        this.STARTTIME = STARTTIME;
    }

    public String getENDTIME() {
        if (StringUtils.isNotBlank(ENDTIME)) {
            return ENDTIME.substring(0, ENDTIME.length() - 2);
        } else {
            return ENDTIME;
        }
    }

    public void setENDTIME(String ENDTIME) {
        this.ENDTIME = ENDTIME;
    }

    public String getVehicle() {
        return vehicle;
    }

    public void setVehicle(String vehicle) {
        this.vehicle = vehicle;
    }

    public String getVehicleshift() {
        return vehicleshift;
    }

    public void setVehicleshift(String vehicleshift) {
        this.vehicleshift = vehicleshift;
    }

    public String getTRANSPORTION() {
        return TRANSPORTION;
    }

    public void setTRANSPORTION(String TRANSPORTION) {
        this.TRANSPORTION = TRANSPORTION;
    }

    public String getTRAVELSTART() {
        return TRAVELSTART;
    }

    public void setTRAVELSTART(String TRAVELSTART) {
        this.TRAVELSTART = TRAVELSTART;
    }

    public String getTRAVELDESTINATION() {
        return TRAVELDESTINATION;
    }

    public void setTRAVELDESTINATION(String TRAVELDESTINATION) {
        this.TRAVELDESTINATION = TRAVELDESTINATION;
    }

    public String getSTAYTIME() {
        return STAYTIME;
    }

    public void setSTAYTIME(String STAYTIME) {
        this.STAYTIME = STAYTIME;
    }

    public String getISTOUCHPATIENT() {
        return ISTOUCHPATIENT;
    }

    public void setISTOUCHPATIENT(String ISTOUCHPATIENT) {
        this.ISTOUCHPATIENT = ISTOUCHPATIENT;
    }

    public String getNOWTEMPERATURE() {
        return NOWTEMPERATURE;
    }

    public void setNOWTEMPERATURE(String NOWTEMPERATURE) {
        this.NOWTEMPERATURE = NOWTEMPERATURE;
    }

    public String getPHYSICALCONDITION() {
        if (StringUtils.isNotBlank(PHYSICALCONDITION)) {
            PHYSICALCONDITION = PHYSICALCONDITION.replace("\"", "");
            PHYSICALCONDITION = PHYSICALCONDITION.replace("[", "");
            PHYSICALCONDITION = PHYSICALCONDITION.replace("]", "");
            return PHYSICALCONDITION;
        } else {
            return PHYSICALCONDITION;
        }
    }

    public void setPHYSICALCONDITION(String PHYSICALCONDITION) {
        this.PHYSICALCONDITION = PHYSICALCONDITION;
    }

    public String getCONCATPERSON() {
        return CONCATPERSON;
    }

    public void setCONCATPERSON(String CONCATPERSON) {
        this.CONCATPERSON = CONCATPERSON;
    }

    public String getCONCATPERSONTEL() {
        return CONCATPERSONTEL;
    }

    public void setCONCATPERSONTEL(String CONCATPERSONTEL) {
        this.CONCATPERSONTEL = CONCATPERSONTEL;
    }

    public String getNOTE() {
        return NOTE;
    }

    public void setNOTE(String NOTE) {
        this.NOTE = NOTE;
    }

    public String getCOMMUNITY() {
        return COMMUNITY;
    }

    public void setCOMMUNITY(String COMMUNITY) {
        this.COMMUNITY = COMMUNITY;
    }

    public String getADDRESS() {
        return ADDRESS;
    }

    public void setADDRESS(String ADDRESS) {
        this.ADDRESS = ADDRESS;
    }

    public String getCREATETIME() {
        if (StringUtils.isNotBlank(CREATETIME)) {
            return CREATETIME.substring(0, CREATETIME.length() - 2);
        } else {
            return CREATETIME;
        }
    }

    public void setCREATETIME(String CREATETIME) {
        this.CREATETIME = CREATETIME;
    }

    public String getISHUBEI() {
        return ISHUBEI;
    }

    public void setISHUBEI(String ISHUBEI) {
        this.ISHUBEI = ISHUBEI;
    }

    public String getISWUHAN() {
        return ISWUHAN;
    }

    public void setISWUHAN(String ISWUHAN) {
        this.ISWUHAN = ISWUHAN;
    }

    public String getSEPSTYLE() {
        return SEPSTYLE;
    }

    public void setSEPSTYLE(String SEPSTYLE) {
        this.SEPSTYLE = SEPSTYLE;
    }

    public String getLEAVETIME() {
        if (StringUtils.isNotBlank(LEAVETIME)) {
            return LEAVETIME.substring(0, LEAVETIME.length() - 2);
        } else {
            return LEAVETIME;
        }
    }

    public void setLEAVETIME(String LEAVETIME) {
        this.LEAVETIME = LEAVETIME;
    }

    public String getARRIVETIME() {
        if (StringUtils.isNotBlank(ARRIVETIME)) {
            return ARRIVETIME.substring(0, ARRIVETIME.length() - 2);
        } else {
            return ARRIVETIME;
        }
    }

    public void setARRIVETIME(String ARRIVETIME) {
        this.ARRIVETIME = ARRIVETIME;
    }

    public String getNEEDHOSPITAL() {
        return NEEDHOSPITAL;
    }

    public void setNEEDHOSPITAL(String NEEDHOSPITAL) {
        this.NEEDHOSPITAL = NEEDHOSPITAL;
    }

    public String getDISTRICT() {
        return DISTRICT;
    }

    public void setDISTRICT(String DISTRICT) {
        this.DISTRICT = DISTRICT;
    }

    public String getCOMEFROM() {
        return COMEFROM;
    }

    public void setCOMEFROM(String COMEFROM) {
        this.COMEFROM = COMEFROM;
    }

    public String getSTATUS() {
        return STATUS;
    }

    public void setSTATUS(String STATUS) {
        this.STATUS = STATUS;
    }

    public String getUPDATETIME() {
        if (StringUtils.isNotBlank(UPDATETIME)) {
            return UPDATETIME.substring(0, UPDATETIME.length() - 2);
        } else {
            return UPDATETIME;
        }
    }

    public void setUPDATETIME(String UPDATETIME) {
        this.UPDATETIME = UPDATETIME;
    }

    public String getCough() {
        return cough;
    }

    public void setCough(String cough) {
        this.cough = cough;
    }

    public String getPolypnea() {
        return polypnea;
    }

    public void setPolypnea(String polypnea) {
        this.polypnea = polypnea;
    }

    public String getTouchdate() {
        return touchdate;
    }

    public void setTouchdate(String touchdate) {
        this.touchdate = touchdate;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getOthersymptom() {
        return othersymptom;
    }

    public void setOthersymptom(String othersymptom) {
        this.othersymptom = othersymptom;
    }

    public String getOpinion() {
        return opinion;
    }

    public void setOpinion(String opinion) {
        this.opinion = opinion;
    }

    public String getStartcity() {
        return startcity;
    }

    public void setStartcity(String startcity) {
        this.startcity = startcity;
    }

    public String getStartprovince() {
        return startprovince;
    }

    public void setStartprovince(String startprovince) {
        this.startprovince = startprovince;
    }

    public String getEnterprisecreditcode() {
        return enterprisecreditcode;
    }

    public void setEnterprisecreditcode(String enterprisecreditcode) {
        this.enterprisecreditcode = enterprisecreditcode;
    }

    public String getCommittee() {
        return committee;
    }

    public void setCommittee(String committee) {
        this.committee = committee;
    }

    public String getReporterphone() {
        return reporterphone;
    }

    public void setReporterphone(String reporterphone) {
        this.reporterphone = reporterphone;
    }

    public String getSYS_ID() {
        return SYS_ID;
    }

    public void setSYS_ID(String SYS_ID) {
        this.SYS_ID = SYS_ID;
    }

    public String getFever() {
        return fever;
    }

    public void setFever(String fever) {
        this.fever = fever;
    }

    public String getISWENZHOU() {
        return ISWENZHOU;
    }

    public void setISWENZHOU(String ISWENZHOU) {
        this.ISWENZHOU = ISWENZHOU;
    }

    public String getFever_touch() {
        return fever_touch;
    }

    public void setFever_touch(String fever_touch) {
        this.fever_touch = fever_touch;
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
