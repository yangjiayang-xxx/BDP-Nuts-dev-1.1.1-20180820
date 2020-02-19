package com.nuts.demo.login;

import com.nuts.framework.PlatformAPI;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by hsha on 2018/3/23 16:51
 */
@Controller
@RequestMapping("/login/")
public class LoginController{

    @RequestMapping("page")
    public ModelAndView toLoginPage(HttpSession session , HttpServletResponse response){
        if(session.getAttribute("currentUserInfo") != null){
            //已登录，跳转到首页
            PrintWriter out = null;
            try{
                out = response.getWriter();
                response.setContentType("text/html;charset=UTF-8");
                //自定义登录页面的情况下， 访问业务url若没登录的话，登录完成后，再重定向到之前访问的页面
                out.println("<script  type=\"text/javascript\">window.top.location.href='"+PlatformAPI.getSysConfigValue("local.home")+"'</script>");
            }catch(IOException e){
                e.printStackTrace();
            }
            return null;
        }else{
            //没登录，跳转到登录页面
            ModelAndView modelAndView = new ModelAndView("demo/login");
            modelAndView.addObject("casHome",PlatformAPI.getSysConfigValue("cas.home"));
            modelAndView.addObject("localHome",PlatformAPI.getSysConfigValue("local.home"));
            modelAndView.addObject("localLoiginUrl",PlatformAPI.getSysConfigValue("local.login.url"));

            //禁止缓存，来防止后退时，由于浏览器直接读取缓存，造成登录页脚本验证失败
            response.setHeader("Cache-Control", "no-store");
            response.setHeader("Pragma", "no-cache");
            response.setDateHeader("Expires", 0);
            return modelAndView;
        }
    }


    @RequestMapping("needAuth")
    public ModelAndView needAuth(){
        ModelAndView modelAndView = new ModelAndView("demo/modifyPassword");
        return modelAndView;
    }
}
