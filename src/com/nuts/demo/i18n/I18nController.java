package com.nuts.demo.i18n;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by hsha on 2018/3/16 10:47
 */
@Controller
@RequestMapping("/i18n")
public class I18nController{
    @RequestMapping("/hello")
    public String index() {
        return "demo/i18n";
    }
}
