package com.nuts.fs.controller;

import com.centit.framework.common.WebOptUtils;
import com.centit.framework.model.basedata.IUserInfo;
import com.centit.framework.security.model.CentitUserDetails;
import com.nuts.fs.controller.base.BaseController;
import com.nuts.fs.dao.AppDao;
import com.nuts.fs.model.EpidemicReportCompanyTable;
import com.nuts.fs.model.NhsqInfomationTable;
import com.nuts.fs.model.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class AppController extends BaseController {

    private final AppDao appDao;

    @Autowired
    public AppController(AppDao appDao) {
        this.appDao = appDao;
    }






    /**
     * 人员信息表查询（nhsq_infomation)
     */
    @PostMapping("/personQuery")
    @ResponseBody
    public Object personQuery(NhsqInfomationTable nhsqInfomationTable, Page page) {
        CentitUserDetails loginUser = WebOptUtils.getLoginUser();
        IUserInfo userInfo = loginUser.getUserInfo();
        List<NhsqInfomationTable> list = appDao.getNhsqInfomationTable(nhsqInfomationTable, page, userInfo.getLoginName());
        Page<NhsqInfomationTable> pageReturn = new Page<>();
        pageReturn.setPageNo(page.getPageNo());
        pageReturn.setPageSize(page.getPageSize());
        pageReturn.setSortName(page.getSortName());
        pageReturn.setSortOrder(page.getSortOrder());
        pageReturn.setTotal(page.getTotal());
        pageReturn.setList(list);
        return pageReturn;
    }

    /**
     * 企业违规复工表查询(epidemic_report_company)
     */
    @PostMapping("/epidemicReportCompanyQuery")
    @ResponseBody
    public Object epidemicReportCompanyQuery(EpidemicReportCompanyTable epidemicReportCompanyTable, Page page) {
        CentitUserDetails loginUser = WebOptUtils.getLoginUser();
        IUserInfo userInfo = loginUser.getUserInfo();
        List<EpidemicReportCompanyTable> list = appDao.getEpidemicReportCompanyTable(epidemicReportCompanyTable, page, userInfo.getLoginName());
        Page<EpidemicReportCompanyTable> pageReturn = new Page<>();
        pageReturn.setPageNo(page.getPageNo());
        pageReturn.setPageSize(page.getPageSize());
        pageReturn.setSortName(page.getSortName());
        pageReturn.setSortOrder(page.getSortOrder());
        pageReturn.setTotal(page.getTotal());
        pageReturn.setList(list);
        return pageReturn;
    }
}