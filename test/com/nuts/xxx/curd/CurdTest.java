package com.nuts.xxx.curd;

import com.alibaba.fastjson.JSON;
import com.nuts.demo.curd.controller.CurdController;
import com.nuts.framework.base.BaseJunit4Test;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by hsha on 2018/3/23 14:05
 */

public class CurdTest extends BaseJunit4Test{

    @Autowired
    CurdController curdController;

    @Test
    public void testDelete(){
        try{
            Map<String,Object> map = new HashMap<>();
            map.put("username","from 测试模块");
            map.put("age",12);
            map.put("id","234252523");
            String requestBody = JSON.toJSONString(map);
            this.mockMvc.perform(MockMvcRequestBuilders.post("/users/").accept(MediaType.APPLICATION_JSON).content(requestBody));
        }catch(Exception e){
            e.printStackTrace();
        }
    }
}
