package com.nuts.demo.password;

import com.nuts.framework.PlatformAPI;
import com.nuts.framework.base.Response;
import com.nuts.framework.exception.UserInfoException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by hsha on 2018/3/30 13:40
 */
@Controller
@RequestMapping("/password")
public class PasswordController{
    /**
     * 修改密码的demo
     * @param oldPass 旧密码
     * @param newPass 新密码
     * @return
     */
    @PutMapping
    @ResponseBody
    public Response modify(@RequestParam String oldPass, @RequestParam String newPass){
        try{
            PlatformAPI.changeUserPassword(oldPass,newPass);
            return Response.ok();
        }catch(UserInfoException e){
            return Response.error(e.getMessage());
        }
    }
}
