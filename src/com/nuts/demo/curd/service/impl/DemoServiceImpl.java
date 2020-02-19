package com.nuts.demo.curd.service.impl;

import com.nuts.demo.curd.entities.UserEntity;
import com.nuts.demo.curd.service.IDemoService;
import com.nuts.framework.base.Page;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Administrator on 2018/3/6.
 */
@Service
public class DemoServiceImpl implements IDemoService{

//    @Autowired
//    private DemoDAO demoDAO;

    /**
     * 添加
     * @param user 用户信息
     */
    public void save(UserEntity user){
        //验证参数合法性

        //执行业务逻辑

        //调用DAO
//        demoDAO.save(user);

        //处理返回结果
    }





    public List<UserEntity> queryForList() throws SQLException{
//        return  demoDAO.queryEntities();
        return new ArrayList<>();
    }

    public List<UserEntity> queryForList(String username, Page page){
//        return demoDAO.queryForPageList(username,page);
        return new ArrayList<>();
    }



    public void delete(String id){
//        demoDAO.delete(id);
    }

    public void update(UserEntity user){
//        demoDAO.update(user);
    }
}
