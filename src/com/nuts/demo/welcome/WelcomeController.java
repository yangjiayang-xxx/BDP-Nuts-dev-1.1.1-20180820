package com.nuts.demo.welcome;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

/**
 * Created by Administrator on 2018/8/9 9:17
 */
@Controller
@RequestMapping("/welcome")
public class WelcomeController{
    @RequestMapping
    public ModelAndView welcome(){
        return new ModelAndView("demo/welcome");
    }
}
