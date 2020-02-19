package com.nuts.demo.views;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by hsha on 2018/3/20 19:27
 */
@Controller
@RequestMapping("view")
public class ViewController{
    Logger logger = LoggerFactory.getLogger(this.getClass());


    @GetMapping("page")
    public String page(){
        return "demo/view";
    }



    @GetMapping("jsp")
    public String jsp(){
        logger.info("进入了jsp方法");
        return "demo/curd";
    }

    @GetMapping("vm")
    public String vm(){
        logger.info("进入了VM方法");
        return "demo/demo";
    }
}
