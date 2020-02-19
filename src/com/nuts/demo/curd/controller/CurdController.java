package com.nuts.demo.curd.controller;

import com.alibaba.fastjson.JSON;
import com.nuts.demo.curd.entities.UserEntity;
import com.nuts.demo.curd.service.impl.DemoServiceImpl;
import com.nuts.framework.base.Page;
import com.nuts.framework.base.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

@Controller
@RequestMapping("/users/")
public class CurdController{

    Logger logger = LoggerFactory.getLogger(this.getClass());

    private static final  String CURD_PAGE = "demo/curd";

    @Autowired
    DemoServiceImpl demoService;

    @PostMapping
    public ModelAndView add(@ModelAttribute UserEntity user){
        if(logger.isInfoEnabled()){
            logger.info(String.format("进入了add方法：%s", JSON.toJSONString(user)));
        }
        demoService.save(user);
        return new ModelAndView();
    }


    /**
     * 打开某个页面
     */
        @GetMapping("page")
    public ModelAndView page(){
        return new ModelAndView(CURD_PAGE);
    }


    /**
     * 删除
     */
    @DeleteMapping("/{id}")
    @ResponseBody
    public Response delete(@PathVariable String id){
        if(logger.isInfoEnabled()){
            logger.info(String.format("进入了delete方法：%s", id));
        }
        demoService.delete(id);
        return Response.ok("删除Id为"+id+"的用户成功！");
    }


    /**
     * 修改
     */
    @PutMapping
    public ModelAndView update(@ModelAttribute UserEntity user){
        if(logger.isInfoEnabled()){
            logger.info(String.format("进入了update方法：%s",JSON.toJSONString(user)));
        }
        demoService.update(user);
        return new ModelAndView(CURD_PAGE);
    }

    /**
     * 分页列表数据
     * users/search?username=zhangsan
     * @return
     */
    @GetMapping("/search")
    @ResponseBody
    public Response list(String username,Page page){
        List<UserEntity> entities = demoService.queryForList(username,page);
        return Response.ok(entities,page);
    }

    /**
     * 详情数据
     * @return
     */
    @GetMapping("/{id}")
    @ResponseBody
    public Response detail(@PathVariable String id){
        if(logger.isInfoEnabled()){
            logger.info(String.format("进入了detail方法：%s", id));
        }
        return Response.ok();
    }
}
