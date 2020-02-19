package com.nuts.framework.base;

import org.junit.Before;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * 单元测试基类
 * Created by hsha on 2018/3/23 14:09
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(locations ={"classpath:config/spring/nuts-spring-context.xml"})
public class BaseJunit4Test{

    protected MockMvc mockMvc;

    @Autowired
    protected WebApplicationContext wac;

    @Before
    public void setup(){
        //加载web容器上下文
        mockMvc= MockMvcBuilders.webAppContextSetup(this.wac).build();
    }

    @Before
    public void setup2(){
        //加载web容器上下文
    }
}
