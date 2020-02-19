package com.nuts.log;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * 日志单元测试
 * @author zouwuyang
 * @date 2018/6/12
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:config/spring/nuts-spring-context.xml")
public class LogAPITest {

    @Test
    public void testLog() throws Exception{
        System.out.println(1);
//        LogAPI.writeLog(-1L, "http://www.baidu.com", "thunder", OperateType.INSERT, null, "10.0.200.46", "21345", "测试", "测试", 1L, 1L, null);
    }
}
