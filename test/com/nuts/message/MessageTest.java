package com.nuts.message;

import com.centit.framework.model.adapter.NotificationCenter;
import com.nuts.framework.config.SpringConfig;
import com.nuts.framework.config.activemq.ActiveMQConfig;
import com.nuts.framework.messageclient.MessageClientConfig;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockServletContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.web.context.ContextLoader;
import org.springframework.web.context.ContextLoaderListener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * 消息客户端接口单元测试
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(
classes = {ActiveMQConfig.class, SpringConfig.class, MessageClientConfig.class})
public class MessageTest {
    @Autowired
    private NotificationCenter notificationCenter;

    @Before
    public void init(){
        MockServletContext sc = new MockServletContext("");
        sc.addInitParameter(ContextLoader.CONFIG_LOCATION_PARAM, "/config/spring/nuts-spring-context.xml");
        ServletContextListener listener = new ContextLoaderListener();
        ServletContextEvent event = new ServletContextEvent(sc);
        listener.contextInitialized(event);
    }

    @Test
    public void testSendApp(){

        System.out.println(notificationCenter.sendAppMessage("1", "-1", "hello", "你好啊！", null));
    }
    @Test
    public void testSendWarn(){
        System.out.println(notificationCenter.sendWarnMessage("1", "-1", "测试", "你好啊a！", "http://172.32.6.3:8088/bdp-auth"));
    }
}
