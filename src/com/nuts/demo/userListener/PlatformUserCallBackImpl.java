package com.nuts.demo.userListener;

import com.nuts.framework.userlistener.IUserChangeCallback;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by Administrator on 2018/8/9 13:57
 */
public class PlatformUserCallBackImpl implements IUserChangeCallback{
    private Logger logger = LoggerFactory.getLogger(this.getClass());
    private String logFormat = "执行了%s方法,userid为%s";
    @Override
    public void onUpdate(String userid){
        if(logger.isInfoEnabled()){
            logger.info(String.format(logFormat,"update",userid));
        }
    }

    @Override
    public void onDelete(String userid){
        if(logger.isInfoEnabled()){
            logger.info(String.format(logFormat, "delete", userid));
        }
    }

    @Override
    public void onAdd(String userid){
        if(logger.isInfoEnabled()){
            logger.info(String.format(logFormat,"add",userid));
        }
    }
}
